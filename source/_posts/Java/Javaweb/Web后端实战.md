---
title: Web后端实战
date: 2025-12-19
description: 本文为 Web 后端实战项目笔记，涵盖三层架构、Cookie/Session、JWT 与跨域处理。
categories:
  - Java
  - Javaweb
tags:
  - web/project
  - web/springboot
  - web/mybatis
  - Tlias
  - Restful
---
# Web后端实战

> Tlias智能学习辅助系统

## 准备工作

### 需求

+ 部门管理
  - 查询、新增、修改、删除
+ 员工管理
  - 查询、新增、修改、删除
  - 文件上传
+ 报表统计
+ 登录认证
+ 日志管理
+ 班级、学员管理(实战内容)

### 开发规范-开发模式

+ 主流开发模式：前后端分离

+ 开发流程：需求分析->接口设计->前后端并行开发->测试->联调

### 开发规范-Restful风格

#### Restful

+ Rest，表述性状态转化，它是一种软件架构风格。

| REST 风格 URL                   | 请求方式 | 含义                |
| ------------------------------- | -------- | ------------------- |
| `http://localhost:8080/users/1` | GET      | 查询 id 为 1 的用户 |
| `http://localhost:8080/users/1` | DELETE   | 删除 id 为 1 的用户 |
| `http://localhost:8080/users`   | POST     | 新增用户            |
| `http://localhost:8080/users`   | PUT      | 修改用户            |

> 注意：
>
> 1、Rest是风格，是约定方式，约定不是规定，可以打破
>
> 2、描述功能模块通常使用复数形式(加s)，表示此类资源，而非单个资源。如：users、books 等等 ... ...

#### Apifox

+ 介绍：APIfox是一款集成了Api文档、Api调试、Api Mock、Api测试的一体化协作平台
+ 作用：接口文档管理、接口请求测试、Mock服务

### 工程搭建

+ 1、创建SpringBoot工程，并引入web开发依赖、mybatis、mysql驱动、lombok。
+ 2、创建数据库表dept，并在application.yml中配置数据库的基本信息
+ 3、准备基础代码结构，并引入实体类Dept及统一响应结果封装类 Result。

## 查询部门

### 数据封装

实体类属性名 和 数据库表查询返回的字段名一致，mybatis会自动封装。

如果实现类属性名 和 数据库表查询返回的字段名不一样，不能自动封装

解决方法：

+ **手动结果映射**：通过 `@Results`及`@Result` 进行手动结果映射

  ```java
  @Results({
      @Result(column = "create_time", property = "createTime"),
      @Result(column = "update_time", property = "updateTime")
  })
  @Select("SELECT id, name, create_time, update_time FROM dept ORDER BY update_time DESC")
  public List<Dept> findAll();
  ```

+ **起别名**：在SQL语句中，对不一样的列表起别名，别名和实体类属性名一样

  ```java
  @Select("SELECT id, name, create_time AS createTime, update_time AS updateTime FROM dept ...")
  public List<Dept> findAll();
  ```

+ **开启驼峰命名：**如果字段名和属性名符合驼峰命名规则，mybatis会自动通过驼峰命名规则映射。

  > 字段名有下划线，会把下划线转驼峰

  ```yml
  mybatis:
    configuration:
      map-underscore-to-camel-case: true
  ```

### 前后端联调测试

+ Nginx的**反向代理**

  反向代理是一种网络架构，通过代理服务器为后端的服务器做代理，客户端的请求直接请求代理服务器，然后转发给后端的服务器。（安全、灵活、负载均衡）

## 删除部门

## 🔗 相关链接

- [[Java/Javaweb/Web基础|Web 基础]] — SpringBoot IOC/DI、三层架构、HTTP
- [[Java/Javaweb/MySQL|MySQL]] — 数据库表设计与查询
- [[Java/Javaweb/Mybatis|Mybatis]] — 持久层 CRUD 操作
- [[Java/Javaweb/Spring AOP|Spring AOP]] — 日志与事务管理
- [[Java/Javaweb/Maven|Maven]] — 项目依赖管理

### Controller接受参数

+ `接收请求参数：DELETE    /depts？id=8`        ————简单参数

+ 方式一：通过原始的 `HttpServletRequest` 对象获取请求参数

  ```java
  @DeleteMapping("/depts")
  public Result delete(HttpServletRequest request) {
      String idStr = request.getParameter("id");
      int id = Integer.parseInt(idStr);  //手动类型转换，操作繁琐
      System.out.println("根据ID删除部门：" + id);
      return Result.success();
  }
  ```

+ 方式二：通过Spring提供的`@Requestparam`注解，将请求参数绑定给方法形参。

  ```java
  @DeleteMapping("/depts")
  public Result delete(@RequestParam("id") Integer deptId) {
      System.out.println("根据ID删除部门：" + deptId);
      return Result.success();
  }
  ```

  > 一旦声明了`@RequestParam`，该参数在请求时必须传递，如果不传递将会报错，（默认 `required`为`true`），如果参数可选，可以将属性设置为`false`

+ 方法三：如果请求的参数名与形参变量名相同，直接定义方法形参即可接收。(省略`@RequestParam`)（推荐）

  ```java
  @DeleteMapping("/depts")
  public Result delete(Integer deptId) {
      System.out.println("根据ID删除部门：" + deptId);
      return Result.success();
  }
  ```

  > 前端传递的请求参数名与服务端方法名称一致

## 新增部门

### Controller接收参数

+ 接受json格式的请求参数： POST    /depts   {"name" : "教研部"} 
+ JSON格式的参数，通常会使用一个实体对象进行接收,封装至对象当中。

+ 规则：保证 JSON 数据的**键名**与方法形参**对象的属性名**相同，并需要使用`@RequestBody`注解标识。

```java
@PostMapping("/depts")
public Result add(@RequestBody Dept dept) {
    System.out.println("添加部门：" + dept);
    deptService.add(dept);
    return Result.success();
}
```

## 修改部门

### 需求

+ 1、查询回显
+ 2、修改数据

### 查询回显-根据ID查询

#### Controller接收参数

+ 接收请求参数(路径参数)：GET       /depts/1
+ 路径参数：通过请求URL直接传递参数，使用{...}来标识该路径参数 ，需要使用`@PathVariable`获取路径参数

```java
@GetMapping("/depts/{id}")
public Result getInfo(@PathVariable("id") Integer deptId) {
    System.out.println("根据ID查询部门数据：" + deptId);
    Dept dept = deptService.getInfo(deptId);
    return Result.success(dept);
}
```

> 注意：若路径参数的参数名与方法形参名称一致，可以省略注解后value属性的属性值

+ 接收多个路径参数：如`depts/1/0`：

  ```java
  @GetMapping("/depts/{id}/{sta}")
  public Result getInfo(@PathVariable("id") Integer id, @PathVariable Integer sta) {
      //...
  }
  ```

## @RequestMapping

+ 一个完整的请求路径，应该是类上的 @RequestMapping 的value属性 + 方法上的 @RequestMapping的value属性

## 日志技术(Logback)

+ 程序中的日志，是用来记录应用程序的运行信息、状态信息、错误信息等。

+ 好处：数据追踪、性能优化、问题排查、系统监控。

### 常见框架

- Log4j：一个流行的日志框架，提供了灵活的配置选项，支持多种输出目标。
- Logback：基于 Log4j 升级而来，提供了更多的功能和配置选项，性能优于 Log4j。
- Slf4j (Simple Logging Facade for Java)：简单日志门面，提供了一套日志操作的标准接口及抽象类，允许应用程序使用不同的底层日志框架。

### Logback快速入门

+ 准备工作：引入logback的依赖(springboot项目中该依赖已传递)、配置文件logback.xml

  ```java
  private static final Logger log = LoggerFactory.getLogger(LogTest.class)
  ```

+ 记录日志：定义日志记录对象Logger，记录日志。

### Logback配置文件详解

+ 配置文件名：logback.xml

+ 该配置文件是对Logback日志框架输出的日志进行控制的，可以来配置输出的格式、位置及日志开关等。

+ 常用的两种输出日志的位置：控制台、系统文件

  ```xml
  <!-- 控制台输出 -->
  <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
      <!-- 此处省略具体配置，如 encoder、pattern 等 -->
      ...
  </appender>
  ```

  ```xml
  <!-- 系统文件输出 -->
  <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
      <!-- 此处省略具体配置，如 file、rollingPolicy、encoder 等 -->
      ...
  </appender>
  ```

+ 开启日志(ALL)，关闭日志(OFF)

  ```xml
  <!-- 开启日志 (ALL)，关闭日志 (OFF) -->
  <root level="ALL">
      <appender-ref ref="STDOUT" />
      <appender-ref ref="FILE" />
  </root>
  ```

### Logback日志级别

+ 日志级别指的是日志信息的类型，日志都会分级别，常见的日志级别如下(**级别由低到高**)：

  | 日志级别 | 说明                                                         | 记录方式           |
  | -------- | ------------------------------------------------------------ | ------------------ |
  | `trace`  | 追踪，记录程序运行轨迹 【使用很少】                          | `log.trace("...")` |
  | `debug`  | 调试，记录程序调试过程中的信息，实际应用中一般将其视为最低级别 【使用较多】 | `log.debug("...")` |
  | `info`   | 记录一般信息，描述程序运行的关键事件，如：网络连接、io操作 【使用较多】 | `log.info("...")`  |
  | `warn`   | 警告信息，记录潜在有害的情况 【使用较多】                    | `log.warn("...")`  |
  | `error`  | 错误信息 【使用较多】                                        | `log.error("...")` |

+ 可以在配置文件中，灵活的控制输出那些类型的日志。(大于等于配置的日志级别的日志从才会输出)

  ```xml
  <root level="日志级别">
      <appender-ref ref="STDOUT" />
      <appender-ref ref="FILE" />
  </root>
  ```


## 员工管理

### 员工列表查询

+ 需求：查询所有员工信息，并查=查询出部门名称(涉及到的表：emp、dept) 

### 分页查询

`select * from emp e left join dept d on e.dept_id = d.id  limit ?,?;`

`select count(*) from emp e left join dept d on e.dept_id = d.id;`

```java
@Data
public class PageResult<T> {
    private Long total; // 总记录数
    private List<T> rows; // 当前页数据，结果列表
}
```

+ 用于封装分页查询后的结果

```java
@GetMapping
public Result page(@RequestParam(defaultValue = "1") Integer page,
                   @RequestParam(defaultValue = "10") Integer pageSize) {
    log.info("分页请求参数: {}, {}", page, pageSize);
    PageResult<Emp> pageResult = empService.page(page, pageSize);
    return Result.success(pageResult);
}
```

+ 通过`@RequestParam`注解的`defaultValue`属性可以设置参数的默认值

```java
public PageResult<Emp> page(Integer page, Integer pageSize) {
    // 1. 获取总记录数
    Long count = empMapper.count();

    // 2. 获取每一页的数据列表
    Integer start = (page - 1) * pageSize;
    List<Emp> empList = empMapper.list(start, pageSize);

    // 3. 封装分页结果
    return new PageResult<Emp>(count, empList);
}
```

```java
@Mapper
public interface EmpMapper {

    @Select("select count(*) from emp e left join dept d on e.dept_id = d.id")
    public Long count(); // 查询总记录数

    @Select("select e.*, d.name deptName from emp e left join emp e left join dept d on e.dept_id = d.id limit #{start},#{pageSize}")
    public List<Emp> list(Integer start, Integer pageSize); // 查询结果列表
}
```

### PageHelper分页插件

+ 第三方提供的在Mybatis框架中实现分页的插件，用来简化分页操作，提高开发效率。

#### 使用步骤：

1、引入依赖

```xml
<!-- 分页插件PageHelper -->
<dependency>
    <groupId>com.github.pagehelper</groupId>
    <artifactId>pagehelper-spring-boot-starter</artifactId>
    <version>1.4.7</version>
</dependency>
```

2、定义Mapper接口的查询方法(无需考虑分页)

```java
//查询员工数据  Mapper层代码
@Select("select e.* from emp e left join dept d on e.dept_id=d.id order by e.update_time desc ") //不能加分号
public List<Emp> list();
```

3、在Service方法中实现分页查询

```java
//Service层代码
public PageResult<Emp> page(Integer page, Integer pageSize) {
    // 1. 设置分页参数
    PageHelper.startPage(page, pageSize);
    // 2. 调用Mapper接口方法
    List<Emp> empList = empMapper.list(); //仅仅能对紧跟其后的第一个查询语句进行分页处理
    // 3. 解析并封装结果
    return new PageResult<>(...);
}
```

### 条件分页查询

```java
@RestController
public class EmpController {

    @Autowired
    private EmpService empService;

    /**
     * 分页查询
     */
    @GetMapping
    public Result page(@RequestParam(defaultValue = "1") Integer page,
                       @RequestParam(defaultValue = "10") Integer pageSize,
                       String name, Integer gender,
                       @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate begin,
                       @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate end) {
        log.info("分页查询: {},{},{},{},{},{}", page, pageSize, name, gender, begin, end);
        PageResult<Emp> pageResult = empService.page(page, pageSize);
        return Result.success(pageResult);
    }
}
```

#### 程序优化-请求参数接收优化

+ 如果controller方法的参数较多，且未来可能继续增加，这会使得方法签名变得复杂难以维护，此时可以考虑将多个请求参数封装为一个对象。

```java
//EmpQueryparam.java
@Data
public class EmpQueryParam {
    private Integer page = 1; // 当前页码
    private Integer pageSize = 10; // 每页记录数
    private String name; // 员工姓名
    private Integer gender; // 员工性别
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate begin; // 入职日期-开始
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate end; // 入职日期-结束
}
```

```java
//EmpController
@GetMapping
public Result page(EmpQueryParam empQueryParam){
    log.info("分页查询，参数：{}", empQueryParam);
    PageResult<Emp> pageResult = empService.page(empQueryParam);
    return Result.success(pageResult);
}
```

```java
//Service层
@Override
public PageResult<Emp> page(EmpQueryParam empQueryParam) {
    // 1. 设置分页参数 (PageHelper)
    PageHelper.startPage(empQueryParam.getPage(), empQueryParam.getPageSize());

    // 2. 执行查询
    List<Emp> empList = empMapper.list(empQueryParam);

    // 3. 解析查询结果，并封装
    Page<Emp> p = (Page<Emp>) empList;
    return new PageResult<Emp>(p.getTotal(), p.getResult());
}
```

+ 如果参数较少，controller方法中定义一个一个形参接收
+ 如果参数较多，controller方法中定义一个对象接收

#### 动态SQL

```xml
<select id="list" resultType="com.itheima.pojo.Emp">
    SELECT e.*, d.name AS deptName FROM emp e LEFT JOIN dept d ON e.dept_id = d.id
    <where>
        <if test="name != null and name != ''">
            e.name like concat('%',#{name},'%')
        </if>
        <if test="gender != null">
            and e.gender = #{gender}
        </if>
        <if test="begin != null and end != null">
            and e.entry_date between #{begin} and #{end}
        </if>
        order by e.update_time desc
    </where>
</select>
```

### 新增员工

#### 批量保存员工信息

```java
//EmpExprMapper.java
public void insertBatch(List<EmpExpr> exprlist);
```

```xml
//EmpExprMapper.xml
<insert id="insertBatch">
    insert into emp_expr (emp_id, begin, end, company, job) values
    <foreach collection="exprList" item="expr" separator=",">
        (#{expr.empId}, #{expr.begin}, #{expr.end}, #{expr.company}, #{expr.job})
    </foreach>
</insert>
```

+ `<foreach>`属性说明：

  1、collection：集合名称

  2、item：集合遍历出来的元素/项

  3、separator：每一次遍历使用的分隔符

  4、open：遍历开始前拼接的片段

  5、close：遍历结束后拼接的片段
  
+ 插入数据之后，如何获取主键值：

  mapper接口加上注解：`@Options(useGeneratedKeys = true, keyProperty = "id")`

### 事务管理

#### 介绍

+ 事物 是一个操作的集合，它是一个不可分割的工作单位。事务会把所有的操作作为一个整体一起向系统提交或撤销操作请求，即这些操作 **要么同时成功，要么同时失败**

#### 操作

+ 事务控制主要三步操作：开启事务、提交事务/回滚事务。

  ```sql
  -- 开启事务
  start transaction; / begin; 
  
  -- 1. 保存员工基本信息
  insert into emp values (39, 'Tom', '123456', '汤姆', 1, '13300001111', 1, 4000, '1.jpg', '2023-11-01', 1, now(), now());
  
  -- 2. 保存员工的工作经历信息
  insert into emp_expr(emp_id, begin, end, company, job) values
  (39,'2019-01-01', '2020-01-01', '百度', '开发'),
  (39,'2020-01-10', '2022-02-01', '阿里', '架构');
  
  -- 提交事务(全部成功) / 回滚事务(有一个失败)
  commit; / rollback; 
  ```

+ 场景：银行转账、下单扣减库存

#### Spring 事务管理

##### 控制事务

+ 注解：`@Transactional` 
+ 作用：将当前方法交给spring进行事务管理，方法执行前，开启事务；成功执行完毕，提交事务；出现异常，回滚事务
+ 作用：service层的方法上、类上、接口上。 将当前的xxx交给Spring事务管理
+ 推荐加在多次进行增删改的操作上

```yml
#配置事务管理日志级别
logging:
  level:
    org.springframework.jdbc.support.JdbcTransactionManager: debug
```

#### 事务进阶

##### rollbackFor

+ rollbackFor属性用于控制出现何种异常类型，回滚事务。(**默认情况下，只有出现RuntimeException才会回滚)**

  `@Transactional(rollbackFor = {Exception.class})`

##### propagation

+ 事务传播行为：指的就是当一个事务方法被另一个事务方法调用时，这个事务方法应该如何进行事务控制

| 属性值           | 含义                                                         |
| ---------------- | ------------------------------------------------------------ |
| **REQUIRED**     | **【默认值】需要事务，有则加入，无则创建新事务**             |
| **REQUIRES_NEW** | **需要新事务，无论有无，总是创建新事务** ，希望两个方法在独立的事务中运行，互不影响 |
| SUPPORTS         | 支持事务，有则加入，无则在无事务状态中运行                   |
| NOT_SUPPORTED    | 不支持事务，在无事务状态下运行，如果当前存在已有事务，则挂起当前事务 |
| MANDATORY        | 必须有事务，否则抛异常                                       |
| NEVER            | 必须没事务，否则抛异常                                       |

#### 四大特性

+ 原子性：事务是不可分割的最小单元，要么全部成功，要么全部失败
+ 一致性：事务完成时，必须使所有的数据都保持一致状态
+ 隔离性：数据库系统提供的隔离机制，保证事务在不受外部并发操作影响的独立环境下运行。
+ 持久性：事务一旦提交或回滚，它对数据库中的数据的改变就是永久的。

## 文件上传

```java
//服务端接收文件
@Slf4j
@RestController
public class UploadController {
    @PostMapping("/upload")
    public Result handleFileUpload(String name, Integer age, MultipartFile file) {
        log.info("文件上传:{}", file);
        return Result.success();
    }
}
```

### 本地存储

```java
@PostMapping("/upload")
public Result handleFileUpload(MultipartFile file) throws Exception {
    log.info("文件上传:{}", file);
    // 生成唯一文件名
    String uniqueFileName = generateUniqueFileName(file.getOriginalFilename());
    // 保存文件
    file.transferTo(new File("D:/images/" + uniqueFileName));
    return Result.success();
}

private String generateUniqueFileName(String originalFilename) {
    String randomStr = UUID.randomUUID().toString().replaceAll("-", "");
    String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
    return randomStr + extension;
}
```

```yml
spring：
  servlet:
  	multipart:
      # 最大单个文件大小
      max-file-size: 10MB
      # 最大请求大小(包括所有文件和表单数据)
      max-request-size: 100MB
```

### 阿里云OSS（对象存储服务）

 #### 第三方服务-通用思路

**流程步骤**：

1. **注册阿里云（实名认证）**

2. **充值**

3. **开通对象存储服务（OSS）**

4. **创建Bucket**

5. **获取并配置AccessKey（秘钥）**

6. **参照官方SDK编写入门程序**

7. **案例集成OSS**

   **Bucket**：存储空间是用户用于存储对象（Object，就是文件）的容器，所有的对象都必须隶属于某个存储空间。

   **SDK**：Software Development Kit 的缩写，软件开发工具包，包括辅助软件开发的依赖（jar包）、代码示例等，都可以叫做SDK。

#### 入门程序

+ 参考官方文档

#### 案例集成OSS

+ UploadController：1、接收上传的图片；2、将图片存储起来；3、返回图片访问的URL。

**步骤**：

1、引入阿里云OSS文件上传工具类(有官方的示例代码改造而来)

2、上传文件接口开发

```java
@Autowired
private AliyunOSSOperator aliyunOSSOperator;

/**
 * 文件上传
 */
@PostMapping("/upload")
public Result upload(MultipartFile file) throws Exception {
    log.info("文件上传:{}", file);
    String url = aliyunOSSOperator.upload(file.getBytes(), file.getOriginalFilename());
    return Result.success(url);
}
```

#### 参数配置化(白雪)

+ 指将一些需要灵活变化的参数，配置在文件中，然后通过`@Value`注解来注入外部配置的属性（一个属性一个属性注入）

```yml
aliyun:
  oss:
    endpoint: https://oss-cn-beijing.aliyuncs.com
    bucketName: java-ai
    region: cn-beijing
```

```java
@Component
public class AliyunOSSOperator {

    @Value("${aliyun.oss.endpoint}")
    private String endpoint;

    @Value("${aliyun.oss.bucketName}")
    private String bucketName;

    @Value("${aliyun.oss.region}")
    private String region;
}
```

#### @ConfigurationProperties

+ 批量将多个属性注入到bean对象中

```java
@Data
@Component              //前缀
@ConfigurationProperties(prefix = "aliyun.oss")
public class AliyunOSSProperties {
    private String endpoint;
    private String bucketName;
    private String region;
}
```

## 修改员工

### 查询回显

```xml
<select id="getById" resultType="com.itheima.pojo.Emp">
    select
        e.*,
        ee.id ee_id,
        ee.emp_id ee_empid,
        ee.begin ee_begin,
        ee.end ee_end,
        ee.company ee_company,
        ee.job ee_job
    from emp e left join emp_expr ee on e.id = ee.emp_id
    where e.id = #{id}
</select>
```

| 场景                                  | 推荐方式      | 原因                              |
| ------------------------------------- | ------------- | --------------------------------- |
| 单表查询，字段名与属性名一致          | `resultType`  | 简单直接，自动映射                |
| 多表关联，字段名与属性名不一致        | `<resultMap>` | 需手动指定映射关系                |
| 实体类嵌套（如 `Emp` 包含 `EmpExpr`） | `<resultMap>` | `resultType` 无法自动组装嵌套对象 |
| 一对多/多对多关系（如员工有多段经历） | `<resultMap>` | 需用 `<collection>` 处理集合映射  |
| 多表同名列，需避免字段覆盖            | `<resultMap>` | 精准控制列与属性的映射            |

```xml
<!-- 自定义结果集ResultMap -->
<resultMap id="empResultMap" type="com.itheima.pojo.Emp">
    <id column="id" property="id" />
    <result column="username" property="username" />
    <result column="password" property="password" />
    <result column="name" property="name" />
    <result column="gender" property="gender" />
    <result column="image" property="image" />
    <result column="entry_date" property="entryDate" />
    <result column="dept_id" property="deptId" />
    <result column="create_time" property="createTime" />
    <result column="update_time" property="updateTime" />
    <!-- 封装exprList -->
    <collection property="exprList" ofType="com.itheima.pojo.EmpExpr">
        <id column="ee_id" property="id"/>
        <result column="ee_company" property="company"/>
        <result column="ee_job" property="job"/>
        <result column="ee_begin" property="begin"/>
        <result column="ee_end" property="end"/>
        <result column="ee_empid" property="empId"/>
    </collection>
</resultMap>
```

+ 如果查询返回的字段名与实体的属性名可以直接对应上，用`resultMap`
+ 如果查询返回的字段名与实体的属性名对应不上，或实体属性比较复杂，可以通过`resultMap`手动封装。

### 修改员工

+ 修改工作经历(多个数据)思路：先删除，后添加。

+ 动态sql优化：

  ```xml
  <!-- 根据ID修改员工基本信息 -->
  <update id="updateById">
      update emp
      <set>
      <if test="username != null and username != ''">username = #{username},</if>
      <if test="password != null and password != ''">password = #{password},</if>
      <if test="name != null and name != ''">name = #{name},</if>
      <if test="gender != null">gender = #{gender},</if>
      <if test="phone != null and phone != ''">phone = #{phone},</if>
      <if test="job != null">job = #{job},</if>
      <if test="salary != null">salary = #{salary},</if>
      <if test="image != null and image != ''">image = #{image},</if>
      <if test="entryDate != null">entry_date = #{entryDate},</if>
      <if test="deptId != null">dept_id = #{deptId},</if>
      <if test="updateTime != null">update_time = #{updateTime}</if>
  </update>
  	</set>
      where id = #{id}
  </update>
  ```

+ `<set>`:替换`set`关键字，去除字段之后多余的逗号(,)

## 异常处理

+ 全局异常处理器

```java
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler
    public Result handleException(Exception e) {
        log.error("全局异常处理器，拦截到异常", e);
        return Result.error("对不起,服务器异常,请稍后重试");
    }
}
```

## 员工信息统计

### 人数统计

+ 将表格中的字段值转换成具体名称：

```xml
<select id="countEmpJobData" resultType="java.util.Map">
    select
           (case when job = 1 then '班主任'
                 when job = 2 then '讲师'
                 when job = 3 then '学工主管'
                 when job = 4 then '教研主管'
                 when job = 5 then '咨询师'
                 else '其他' end) as pos,
           count(*) as num
    from emp
    group by job order by num
</select>
```

+ 将获取到的数据进行处理：

```java
public JobOption getEmpJobData() {
    List<Map<String, Object>> list = empMapper.countEmpJobData();
    List<Object> jobList = list.stream().map(dataMap -> dataMap.get("pos")).toList();
    List<Object> dataList = list.stream().map(dataMap -> dataMap.get("num")).toList();
    return new JobOption(jobList, dataList);
}
```

### 性别统计

+ if()函数：

```sql
-- 统计员工性别人数
-- if(条件, true_value, false_value)
select
       if(gender = 1, '男性员工', '女性员工') name,
       count(*) value
from emp
group by gender
```



##  登录认证

+ 本质：根据用户名和密码查询员工信息

### 登录校验

#### 思路

+ **登录标记**：用户登录成功之后，在后续的每一次请求中，都可以获取到该标记。【会话技术】
+ **统一拦截**：过滤器Filter、拦截器Interceptor

#### 会话技术

+ **会话**：用户打开浏览器，访问web浏览器的资源，会话建立，直到有一方断开连接，会话结束。在一次会话中可以包含多次请求和响应。
+ **会话跟踪**：一种维护浏览器状态的方法，服务器需要识别多次请求是否来自同一浏览器，以便在同一次对话的多次请求间共享数据。
+ **会话跟踪方案**：
  - 客户端会话跟踪技术：Cookie
  - 服务端会话跟踪技术：Session
  - 令牌技术

##### Cookie

原理：

1、响应头：`Set-Cookie`

2、请求头：`Cookie`

+ 优点：HTTP协议中支持的技术 
+ 缺点：
  - 移动端APP无法使用Cookie
  - 不安全，用户可以禁用Cookie
  - Cookie不能跨域
    - 跨域分为三个维度：协议、IP/域名、端口。

```java
//设置Cookie
@GetMapping("/c1")
public Result cookie1(HttpServletResponse response){
    response.addCookie(new Cookie("login_username", "itheima")); //设置Cookie/响应Cookie
    return Result.success();
}

//获取Cookie
@GetMapping("/c2")
public Result cookie2(HttpServletRequest request){
    Cookie[] cookies = request.getCookies();
    for (Cookie cookie : cookies) {
        if(cookie.getName().equals("login_username")){
            System.out.println("login_username: "+cookie.getValue()); //输出name为login_username的cookie
        }
    }
    return Result.success();
}
```

##### Session 

原理：

Session的底层是基于Cookie的(`Set-Cookie`，`Cookie`)

+ 优点：存储在服务端，安全
+ 缺点：
  - 服务器集群环境下无法直接使用Session
  - Cookie的缺点

```java
@GetMapping("/s1")
public Result session1(HttpSession session){
    log.info("HttpSession-s1: {}", session.hashCode());

    session.setAttribute("loginUser", "tom"); //往session中存储数据
    return Result.success();
}

@GetMapping("/s2")
public Result session2(HttpSession session){
    log.info("HttpSession-s2: {}", session.hashCode());

    Object loginUser = session.getAttribute("loginUser"); //从session中获取数据
    log.info("loginUser: {}", loginUser);
    return Result.success(loginUser);
}
```

##### 令牌（主流方案）

+ 优点：
  - 支持PC端、移动端
  - 解决集群环境下的压力问题
  - 减轻服务器端存储压力

+ 缺点：需要自己实现

#### 令牌技术(JWT令牌)

+ 全称：JSON Web Token
+ 定义了一种简洁的、自包含的格式，用于在通行双方以json数据格式安全的传输信息
+ 组成：
  - 第一部分：Header（头），记录令牌类型、签名算法等。例如：`{"alg":"HS256","type":"JWT"}`
  - 第二部分：Payload（有效载荷），携带一些自定义信息、默认信息等。例如：`{"id":"1","username":"Tom"}`
  - 第三部分：Signature（签名），防止Token被篡改、确保安全性。将header、payload融入，并加入指定秘钥，通过指定签名算法计算而来。

##### 生成/解析

+ 引入`jjwt`的依赖
+ 调用官方提供的工具类`Jwts`类生成或解析`jwt`令牌

```xml
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt</artifactId>
    <version>0.9.1</version>
</dependency>
```

```java
//生成令牌
@Test
public void testGenJwt() {
    Map<String, Object> claims = new HashMap<>();
    claims.put("id", 10);
    claims.put("username", "itheima");

    String jwt = Jwts.builder()
            .signWith(SignatureAlgorithm.HS256, "SVRIRUINQQ==") //指定加密算法，密钥
            .addClaims(claims) //添加自定义信息
            .setExpiration(new Date(System.currentTimeMillis() + 12 * 3600 * 1000)) //设置过期时间
            .compact(); //生成令牌

    System.out.println(jwt);
}
```

```java
@Test
public void testParseJwt() throws Exception {
    String jwtToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."; 

    Claims claims = Jwts.parser()
            .setSigningKey("SVRIRUINQQ==")
            .parseClaimsJws(jwtToken)
            .getBody();

    System.out.println(claims);
}
```

#### 过滤器Filter

##### 快速入门

+ 概念：`Filter过滤器`，是JavaWeb三大组件(Servlet、Filter、Listener)之一
+ 过滤器可以把对资源的请求**拦截**下来，从而实现一些特殊的功能
+ 过滤器一般完成一些**通用**的操作，比如：登录校验、统一编码处理、敏感字符处理等。

步骤：

1、定义Filter：定义一个类，实现Filter接口，并实现其所有方法

2、配置Filter：Filter类加上`@WebFilter`注解，配置拦截路径。引导类(启动类)上加`@ServletComponentScan`开启Servlet组件支持。

```java
@WebFilter(urlPatterns="/*")
public class DemoFilter implements Filter {

    // 初始化方法，web服务器启动时调用，创建Filter实例后只执行一次
    public void init(FilterConfig filterConfig) throws ServletException {
        System.out.println("init ...");
    }

    // 拦截到请求时调用该方法，可被多次调用
    public void doFilter(ServletRequest servletRequest, 
                         ServletResponse servletResponse, 
                         FilterChain chain) throws Exception {
        System.out.println("拦截到了请求...");
        chain.doFilter(servletRequest, servletResponse); // 放行请求
    }

    // 销毁方法，web服务器关闭时调用，只执行一次
    public void destroy() {
        System.out.println("destroy ... ");
    }
}
```

##### 令牌校验Filter

流程：

1、获取请求url

2、判断请求url中是否包含login，如果包含，说明是登录操作，放行。

3、获取请求头中的令牌（token）。

4、判断令牌是否存在，如果不存在，响应401.

5、解析token，如果解析失败，响应401.

6、放行。

##### 拦截路径

+ Filter 可以根据需求，配置不同的拦截路径资源

|   拦截路径   | urlPattens值 |                 含义                 |
| :----------: | :----------: | :----------------------------------: |
| 拦截具体路径 |    /login    |  只有拦截`/login`路径时，才会被拦截  |
|   目录拦截   |    /emp/*    | 访问拦截/emp下的所有资源，都会被拦截 |
|   拦截所有   |      /*      |       访问所有资源，都会被拦截       |

##### 过滤器链

+ 介绍：一个web应用中，可以配置多个过滤器，这多个过滤器就形成了一个过滤器链。
+ 顺序：注解配置的Filter，优先级时按照过滤器类名(字符串)的自然排序。

#### 拦截器Interceptor

+ 概念：是一种动态拦截方法调用的机制，类似于过滤器。Spring框架中提供的，主要用来动态拦截控制器方法的执行。
+ 作用：拦截请求，在指定的方法调用前后，根据业务需要执行预先设定的代码。

##### 快速入门

1、定义拦截器，实现`HandlerInterceptor`接口，并实现其所有方法。

2、注册拦截器

```java
@Component
public class DemoInterceptor implements HandlerInterceptor {

    @Override //目标资源执行前执行
    public boolean preHandle(HttpServletRequest req, HttpServletResponse resp, Object handler) throws Exception {
        return true; // 返回 true 表示放行，false 表示拦截
    } 

    @Override //目标资源方法执行后执行
    public void postHandle(HttpServletRequest req, HttpServletResponse resp, Object handler, ModelAndView mv) throws Exception { 
        System.out.println("postHandle..."); 
    }

    @Override //视图渲染完毕后执行，最后执行
    public void afterCompletion(HttpServletRequest req, HttpServletResponse resp, Object handler, Exception ex) throws Exception {
        System.out.println("afterCompletion...");
    }
}
```

```java
//WebConfig.java  注册拦截器
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Autowired
    private DemoInterceptor demoInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(demoInterceptor).addPathPatterns("/**");
    }
}
```

##### 令牌校验Interceptor

##### 拦截路径

+ 拦截器可以根据需求，配置不同的拦截路径

```java
@Override
public void addInterceptors(InterceptorRegistry registry) {
    registry.addInterceptor(demoInterceptor)
  			.addPathPatterns("/**") //拦截所有请求
        	.excludePathPatterns("/login");//不拦截那些请求
}          
```

| 拦截路径  | 含义                  | 举例                                                  |
| --------- | --------------------- | ----------------------------------------------------- |
| /*        | 一级路径              | 能匹配 /depts, /emps, /login，不能匹配 /depts/1       |
| /**       | 任意级路径            | 能匹配 /depts, /depts/1, /depts/1/2                   |
| /depts/*  | /depts 下的一级路径   | 能匹配 /depts/1，不能匹配 /depts/1/2, /depts          |
| /depts/** | /depts 下的任意级路径 | 能匹配 /depts, /depts/1, /depts/1/2，不能匹配 /emps/1 |

#### Filter 与 Interceptor 区别：

+ 1、接口规范不同：过滤器需要实现Filter接口，而拦截器需要实现HandlerInterceptor接口。
+ 2、拦截范围不同：过滤器Filter会拦截所有的资源，而Interceptor只会拦截Spring环境中的资源。
