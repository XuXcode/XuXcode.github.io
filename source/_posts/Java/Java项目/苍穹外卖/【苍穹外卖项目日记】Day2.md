---
title: 【苍穹外卖项目日记】Day2
date: 2026-07-03
description: 苍穹外卖项目实战日记第二天，记录核心功能模块的开发与实现。
categories:
  - Java
  - Java项目
  - 苍穹外卖
---
# 【苍穹外卖|项目日记】Day2

## 今日完成的任务：

+ 实现编辑员工的接口
+ 导入分类管理功能模块
+ 实现公共字段自动填充
+ 新增菜品的文件上传功能（阿里云OSS存储）
+ 删除修改菜品功能实现

## 今日收获：

### 1、编辑员工信息＋查询回显

1、在写根据id查询员工信息的实现类时，要重新将传回的员工密码进行打码处理，否则数据库中的密码会随着这个方法传回至前端，导致信息泄露

```java
@Override
public Employee getById(Long id) {
    Employee employee = employeeMapper.getById(id);
    employee.setPassword("****");
    return employee;
}
```

2、在完成update实现类的时候，可以使用BeanUils工具类的方法，将employeeDTO的对象属性拷贝到Employee，可以与其他方法共用mapper xml映射中的update方法，提高了代码的复用率

```java
@Override
    public void update(EmployeeDTO employeeDTO) {
        Employee employee = new Employee();
        // 对象属性拷贝
        BeanUtils.copyProperties(employeeDTO, employee);
		...
        ...
        employeeMapper.update(employee);
    }
```

### 2、导入分类管理功能模块

1、导入时要按照mapper-->service-->controller依次导入，这样代码不会显示相应的报错

2、导入后要整个项目进行编译

### 3、公共字段自动填充

#### 实现思路(枚举、注解、AOP、反射)

+ 自定义注解 `AutoFill`，用于标识需要进行公共字段字段填充的方法

  - 进入到sky-server模块，创建com.sky.annotation包。

  ```java
  @Target(ElementType.METHOD) // 表示该注解用于方法上
  @Retention(RetentionPolicy.RUNTIME) // 表示该注解在运行时生效
  public @interface AutoFill {
      OperationType value(); // 用于指定填充数据的操作类型,枚举值
  }
  ```

  - 其中OperationType已在sky-common模块中定义package com.sky.enumeration;

  ```java
  /**
  数据库操作类型
  */
  public enum OperationType {
  
      /**
       * 更新操作
       */
      UPDATE,
  
      /**
       * 插入操作
       */
      INSERT
  }
  ```

+ 自定义切面类`AutoFillAspect`，统一拦截加入了`AutoFill`注解的方法，通过反射为公共字段赋值

  ```java
  /**
  * 自定义切面，实现公共字段自动填充处理逻辑
  */
  @Aspect
  @Component
  @Slf4j
  public class AutoFillAspect {
  
      /**
       * 切入点
       */
      @Pointcut("execution(* com.sky.mapper.*.*(..)) && @annotation(com.sky.annotation.AutoFill)")
      public void autoFillPointcut(){}
  
      /**
       * 逻辑实现
       * @param joinPoint
       */
      @Before("autoFillPointcut()")
      public void autoFill(JoinPoint joinPoint){ // joinPoint 获取方法参数
  
          log.info("开始进行公共字段填充...");
  
          // 获取当前被拦截的方法上的数据库操作类型
          MethodSignature signature = (MethodSignature) joinPoint.getSignature(); //方法签名对象
          AutoFill autoFill = signature.getMethod().getAnnotation(AutoFill.class); //获取方法上的注解对象
          OperationType operationType = autoFill.value(); //获得数据库操作类型
          //获取到当前被拦截的方法的参数————实体对象
          Object[] args = joinPoint.getArgs(); //获取拦截方法的所有参数
          if(args == null || args.length == 0){
              return;
          }
          Object entity = args[0]; //约定：实体对象作为被拦截方法的第一个参数
          //准备赋值的数据
          LocalDateTime now = LocalDateTime.now();
          Long currentId = BaseContext.getCurrentId();
  
          //跟据当前不同的操作类型，为对应的属性通过反射来赋值
          if(operationType == OperationType.INSERT){
              //为4个公共字段赋值
              try {
                  Method setCreateTime = entity.getClass().getDeclaredMethod(AutoFillConstant.SET_CREATE_TIME, LocalDate.class);
                  Method setCreateUser = entity.getClass().getDeclaredMethod(AutoFillConstant.SET_CREATE_USER, Long.class);
                  Method setUpdateTime = entity.getClass().getDeclaredMethod(AutoFillConstant.SET_UPDATE_TIME, LocalDateTime.class);
                  Method setUpdateUser = entity.getClass().getDeclaredMethod(AutoFillConstant.SET_UPDATE_USER, Long.class);
  
                  //通过反射为对象属性赋值
                  setCreateTime.invoke(entity,now);
                  setCreateUser.invoke(entity,currentId);
                  setUpdateTime.invoke(entity,now);
                  setUpdateUser.invoke(entity,currentId);
              } catch (Exception e) {
                  e.printStackTrace();
              }
          } else if (operationType == OperationType.UPDATE) {
              //为2个公共字段赋值
              try {
                  Method setUpdateTime = entity.getClass().getDeclaredMethod(AutoFillConstant.SET_UPDATE_TIME, LocalDateTime.class);
                  Method setUpdateUser = entity.getClass().getDeclaredMethod(AutoFillConstant.SET_UPDATE_USER, Long.class);
  
                  //通过反射为对象属性赋值
                  setUpdateTime.invoke(entity,now);
                  setUpdateUser.invoke(entity,currentId);
              } catch (Exception e) {
                  e.printStackTrace();
              }
          }
      }
  }
  
  ```

+ 在Mapper的方法上加入`AutiFill`注解

### 4、新增菜品功能实现

#### 文件上传

使用阿里云OSS对象存储，在通用接口中调用AliOssUtil的upload方法获取到图片的URL，学会了使用字符串拼接与切片配合UUID的方法生成随机字符串名称的上传文件名，

注意：前端图片回显失败是因为阿里云的bucket没有打开公共权限

```java
/**
 * 通用接口
 */
@RestController
@RequestMapping("/admin/common")
@Slf4j
public class CommonController {

    @Autowired
    private AliOssUtil aliOssUtil;
    /**
     * 文件上传
     */
    @PostMapping("/upload")
    public Result<String> upload(MultipartFile file){
        log.info("文件上传：{}",file);
        try {
            //原始文件名
            String originalFilename = file.getOriginalFilename();
            //截取原始文件名的后缀   dfdfdf.png
            String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            //构造新文件名称
            String objectName = UUID.randomUUID().toString() + extension;

            //文件的请求路径
            String filePath = aliOssUtil.upload(file.getBytes(), objectName);
            return Result.success(filePath);
        } catch (IOException e) {
            log.error("文件上传失败：{}", e);
        }
        return Result.error(MessageConstant.UPLOAD_FAILED);
    }
}
```

#### 新增菜品和对应口味

1、新增菜品方法上加入事务注解

**`@Transactional` 在该方法中的作用**

- **核心目的**：保证 `saveWithFlavor` 方法中的“插入菜品”和“插入口味”两步操作**要么全部成功，要么全部失败**，防止出现“菜品插入成功但口味插入失败”的脏数据。
- **实现机制**：Spring 在方法执行前开启事务，正常结束时提交，抛出异常时自动回滚已执行的所有 SQL。
- **业务价值**：维护菜品与口味的强一致性，符合业务原子性要求

2、在插入菜品的时候要开启在插入的时候获取当前的主键值，将产生的主键值赋值给当前的id属性

```xml
<mapper namespace="com.sky.mapper.DishMapper">

    <insert id="insert" useGeneratedKeys="true" keyProperty="id">
        insert into dish(name, category_id, price, image, description, status, create_time, update_time, create_user, update_user)
            values
        (#{name},#{categoryId},#{price},#{image},#{description},#{createTime},#{updateTime},#{createUser},#{updateUser},#{status})
    </insert>
</mapper>
```

```java
@Service
public class DishServiceImpl implements DishService {

    @Autowired
    private DishMapper dishMapper;

    @Autowired
    private DishFlavorMapper dishFlavorMapper;
    /**
     * 新增菜品和口味
     * @param dishDTO
     */
    @Transactional
    public void saveWithFlavor(DishDTO dishDTO) {

        Dish dish = new Dish();

        BeanUtils.copyProperties(dishDTO, dish);

        //向菜品表插入1条数据
        dishMapper.insert(dish);
        //获取insert语句生成的主键值
        Long dishId = dish.getId();
        //向口味表插入n条数据
        List<DishFlavor> flavors = dishDTO.getFlavors();
        if (flavors != null && flavors.size() > 0) {
            flavors.forEach(dishFlavor ->{
                dishFlavor.setDishId(dishId);
            });
        dishFlavorMapper.insertBatch(flavors);
        }
    }
}
```

3、口味是一个List集合，要在Mapper的XML文件中使用动态SQL

```xml
<mapper namespace="com.sky.mapper.DishFlavorMapper">

    <insert id="insertBatch">
        insert into dish_flavor(dish_id, name, value) VALUES
        <foreach collection="flavors" item="df" separator=",">
            (#{df.dishId},#{df.name},#{df.value})
        </foreach>
    </insert>
</mapper>
```

### 5、删除菜品功能实现

#### 删除代码语句优化

​	通过foreach循环进行循环查库，n此循环会导致2n条SQL语句的发送，导致整个删除功能的性能很差，所以需要优化

```java
//删除菜品表中的菜品数据
for (Long id : ids) {
    dishMapper.deleteById(id);
    //删除菜品关联的口味数据
    dishFlavorMapper.deleteByDishId(id);
}
```

​	所以通过将id的集合数据传入Mapper，然后通过SQL的in与foreach将集合中的id数据串联起来

```sql
delete from dish where id in (?,?,?)
```

```java
 dishMapper.deleteByIds(ids);
```

```xml
<delete id="deleteByDishIds">
     delete from dish_flavor where dish_id
     <foreach collection="dishIds" open="(" close=")" item="dishId" separator=",">
         #{dishId}
     </foreach>
</delete>
```

### 6、修改菜品

删除菜品的基本信息->删除原有的口味信息->重新插入口味信息

## 杂项知识点：

### 1、Spring AOP

+ AOP——面向切面编程
+ 在 Spring AOP 中，可以理解为就是面向方法编程
- 场景：
  
    - 记录系统的操作日志
      
    - 事务管理
      
    - 权限控制
    
- 优点：
  
    1、减少重复代码
    
    2、代码无侵入
    
    3、提高开发效率
    
    4、维护方便
    
- AOP是一种思想，Spring AOP则为该思想在Spring框架中对这种思想进行的实现

#### AOP快速入门

- 需求：统计所有业务方法的执行耗时

1、导入依赖

```xml
dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-aop</artifactId>
</dependency>
```
2、编写AOP程序：针对于特点的方法根据业务需要进行编程

```java
@Aspect //标识当前是一个切面类
@Component
//切面类
public class RecordTimeApsect {
    		//表示拦截某包下任意类的任意方法
    @Around("execution(* com.hut.service.impl.*.*(..))")//切入点表达式
    
    //通知
    public Object recordTime(ProceedingJoinPoint pjp) throws Throwable {
        long beginTime = System.currentTimeMillis();
       //执行目标方法(即被拦截的业务方法)
        Object result = pjp.proceed();
        
        long endTime = System.currentTimeMillis();
        log.info("执行耗时: {} ms", endTime - beginTime);
        
        return result;
    }
}
```

#### AOP核心概念

+ **连接点：JoinPoint**，可以被AOP控制的方法(暗含方法执行时的相关信息)
+ **通知：Advice**，指那些重复的逻辑，也就是共性功能(最终体现为一个方法)
+ **切入点：PointCut**，匹配连接点的条件，通知仅会在切入点方法执行时被应用
+ **切面：Aspect**，描述通知与切入点的对应关系(通知+切入点)
+ **目标对象：Target**，通知所应用的对象

#### AOP进阶

##### 通知类型

+ 根据通知方法执行时机的类型不同，将通知类型分为一下常见的五类：

1、`@Around`：环绕通知，此注解标注的通知方法在目标方法前、后都被执行

> 注意：
>
> 1、`@Around`环绕通知需要自己调用`ProceedingJoinPoint.proceed()`来让原始方法执行，其他通知不需要考虑目标方法执行。
>
> 2、`@Around`环绕通知方法的返回值，必须指定为`Object`，来接收原始方法的返回值。

2、`@Before`：前置通知，此注解标注的通知方法在目标方法前被执行

3、`@After`：后置通知，此注解标注的通知方法在目标方法后被执行，无论是否有异常都会执行

4、`@AfterReturning`:返回后通知，此注解标注的通知方法在目标方法后执行，有异常不会执行

5、`@AfterThrowing`：异常后通知，此注解标注的通知方法发生异常后执行

##### @PointCut

+ 该注解的作用是将公共的切点表达式抽取出来，需要用到时引用该切点表达式即可。

```java
@Pointcut("execution(* com.hut.service.impl.DeptServiceImpl.*(..))")
public void pt() {}

@Around("pt()")
public Object recordTime(ProceedingJoinPoint joinPoint) throws Throwable {
    // 方法体待补充
}
```

+ private：仅能在当前切面类中引用该表达式
+ public：在其他外部切面类中也可以引用该表达式

#### 通知顺序

+ 当有多个切面的切入点都匹配到了目标方法，目标方法运行时，多个通知方法都会被执行。

+ 执行顺序：

  不同切面类中，默认按照切面类的类名字母排序：

  - 目标方法前的通知方法：字母排名靠前的先执行；
  - 目标方法后的通知方法：字母排名靠前的后执行。

+ 用`@Order(数字)`加在切面类上来控制顺序

  - 目标方法前的通知方法：数字小的先执行
  - 目标方法后的通知方法：数字小的后执行

#### 切入点表达式

+ 介绍：描述切入点方法的一种表达式。

+ 作用：用来决定项目中的哪些方法需要加入通知

+ 常见形式：

  1、`execution(...)`：根据方法的签名来匹配

  ```java
  @Before("execution(public void com.hut.service.impl.DeptServiceImpl.delete(java.lang.Integer))")
  public void before(JoinPoint joinPoint){}
  ```

  2、`@annotation(...)`：根据注解匹配

  ```java
  @Before("@annotation(com.hut.anno.Log)")
  public void before(){}
  ```

#### execution

+ `execution`主要根据方法的返回值、包名、类名、方法名、方法参数等信息来匹配，语法为：

  `execution(访问修饰符?  返回值	包名.类名.?方法名(方法参数) throws	异常?)`

+ 其中带 ? 的表示可以省略的部分

  1、访问修饰符：可省略（比如：public、protected）

  2、包名.类名：可省略（不建议）

  3、throw 异常：可省略（注意是方法上声明抛出的异常，不是实际抛出的异常）

+ 可以使用通配符描述切入点

  1、`*`：单个独立的任意符号，可以通配任意返回值、包名、类名、方法名、任意类型的一个参数，也可以通配包、类、方法名的一部分

  `execution(* com.*.service.*.update*(*))`

  2、`..` ：多个连续的任意符号，可以通配任意层级的包，或任意类型、任意个数的参数

  `execution(* com.hut..DeptService.*(..))`

+ 注意：根据业务需要，可以使用 且 (&&) 、或(||)、非(!) 来组合比较复杂的切入点表达式。

+ 书写建议：

  a. 所有业务方法名在命名时尽量规范，方便切入点表达式快速匹配。如：findXxx、updateXxx。

  b. 描述切入点方法通常基于接口描述，而不是直接描述实现类，增强扩展性。

  c. 在满足业务需要的前提下，尽量缩小切入点的匹配范围。如：包名尽量不使用`..`，使用`*`匹配单个包。

#### @annotation

+ `@annotation`切入点表达式，用于匹配标识特有注解的方法

```java
package com.hut.anno;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface LogOperation {
}
```

#### 连接点

+ 在Spring中用`JoinPoint`抽象了连接点，用它可以获取方法执行时的相关信息，如目标类名、方法名、方法参数等。

  - 对于`@Around`通知，获取连接点信息只能使用`ProceedingJoinPoint`

  ```java
  @Around("execution(* com.hut.service.DeptService.*(..))")
  public Object around(ProceedingJoinPoint joinPoint) throws Throwable {
      String className = joinPoint.getTarget().getClass().getName(); // 获取目标类名
      Signature signature = joinPoint.getSignature(); // 获取目标方法签名
      String methodName = joinPoint.getSignature().getName(); // 获取目标方法名
      Object[] args = joinPoint.getArgs(); // 获取目标方法运行参数
      Object res = joinPoint.proceed(); // 执行原始方法，获取返回值（环绕通知）
      return res;
  }
  ```

  - 对于其它四种通知，获取连接点信息只能使用`JoinPoint`，它是`ProceedingJoinPoint`的父类型。

  ```java
  @Before("execution(* com.hut.service.DeptService.*(..))")
  public void before(JoinPoint joinPoint) {
      String className = joinPoint.getTarget().getClass().getName(); // 获取目标类名
      Signature signature = joinPoint.getSignature(); // 获取目标方法签名
      String methodName = joinPoint.getSignature().getName(); // 获取目标方法名
      Object[] args = joinPoint.getArgs(); // 获取目标方法运行参数
  }
  ```

### 2、反射获取成员方法

#### Class 类中用于获取成员方法的方法

| 方法名                                                       | 说明                                                         |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| `Method[] getMethods()`                                      | 返回所有公共成员方法对象的数组，**包括从父类继承的公共方法** |
| `Method[] getDeclaredMethods()`                              | 返回当前类中所有成员方法对象的数组**（不包括继承的方法）**，包含私有、保护、默认和公共方法 |
| `Method getMethod(String name, Class<?>... parameterTypes)`  | 根据方法名和参数类型，返回一个公共成员方法对象（仅限 public 方法） |
| `Method getDeclaredMethod(String name, Class<?>... parameterTypes)` | 根据方法名和参数类型，返回一个任意访问权限的成员方法对象（可访问 private 方法） |

#### Method类中用于调用方法的方法

| 方法名                                      | 说明                                            |
| ------------------------------------------- | ----------------------------------------------- |
| `Object invoke(Object obj, Object... args)` | 调用指定方法                                    |
| 参数一：`obj`                               | 要调用方法的对象实例（若为静态方法则传 `null`） |
| 参数二：`args`                              | 传递给方法的参数，可为空（无参方法无需传入）    |
| 返回值                                      | 方法的执行结果（无返回值时返回 `null`）         |

## 总结：

今天学习了一个重难点就是公共字段自动填充的功能实现，主要是使用了AOP和反射的思路，也是通过学习发现了这个后端的内容不仅仅是实现某些功能，而是通过借助某些知识点，优化相关的功能与提升开发效率，通过苍穹外卖的学习学会了一些相关的企业开发规范，同时也将以前不熟悉不理解的知识点再次回顾温习了一遍。
