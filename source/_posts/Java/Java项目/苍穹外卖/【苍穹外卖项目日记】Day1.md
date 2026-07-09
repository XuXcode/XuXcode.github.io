---
title: 【苍穹外卖项目日记】Day1
date: 2026-07-03
description: 苍穹外卖项目实战日记第一天，记录项目初始化、环境搭建与基础配置过程。
categories:
  - Java
  - Java项目
  - 苍穹外卖
---
# 【苍穹外卖|项目日记】Day1

>完成了JavaWeb的学习之旅，我对Spring和SSM架构不再陌生。为了将理论知识转化为实战能力，我选择了“苍穹外卖”作为我的第一个单体项目。接下来的内容，我将以日记为载体，真实记录自己在编码中遇到的挑战、攻克的难题以及点滴进步，分享这段宝贵的学习历程。

## 今日完成的任务：

+ 了解了软件开发的流程以及项目的架构
+ 学习了如何搭建开发环境
+ 完善了登录功能
+ 实现了新增员工的接口
+ 实现了员工分页展示与查询的接口
+ 实现了启用禁用员工账号接口

## 今日收获：

### 1、 学习了开发环境的搭建

1、通过初始工程，了解了项目的整体结构，学习到了一些命名规范

| 名称         | 说明                                                         |
| ------------ | ------------------------------------------------------------ |
| sky-take-out | maven父工程，统一管理依赖版本，聚合其他子模块                |
| sky-common   | 子模块，存放公共类，例如：工具类、常量类、异常类等           |
| sky-pojo     | 子模块，存放实体类、VO、DTO等                                |
| sky-server   | 子模块，后端服务，存放配置文件、Controller、Service、Mapper等 |

| 名称 | 说明 |
| :--- | :--- |
| Entity | 实体，通常和数据库中的表对应 |
| DTO | 数据传输对象，通常用于程序中各层之间传递数据 |
| VO | 视图对象，为前端展示数据提供的对象 |
| POJO | 普通Java对象，只有属性和对应的getter和setter |

2、学会了使用Git进行版本控制（创建Git本地仓库、创建Git远程仓库、将本地文件推送到Git远程仓库）

![image-20260427145954008](C:\Users\84113\AppData\Roaming\Typora\typora-user-images\image-20260427145954008.png)

3、了解了前后端联调中nginx反向代理的原理及操作方法

### 2、熟悉了项目框架

1、学会了如何导入接口文档，并且使用Apifox调试实现的接口

![image-20260427145649169](C:\Users\84113\AppData\Roaming\Typora\typora-user-images\image-20260427145649169.png)

2、在进行接口调试的时候可以将admin账号返回的token，添加到全局参数中，保证调试功能时发送的请求不会被拦截器拦截

![image-20260427150702297](C:\Users\84113\AppData\Roaming\Typora\typora-user-images\image-20260427150702297.png)

3、定义并使用了信息提示常量类，使得代码开发更加规范、优雅。

![image-20260427152113087](C:\Users\84113\AppData\Roaming\Typora\typora-user-images\image-20260427152113087.png)

4、`//TODO`注解能够标记出还未完善的代码，便于后续的开发完善，方便在TODO列表中展示

### 3、完善登录功能

将密码直接明文存储至数据库，安全性低，使用DigestUtils工具类中的MD5加密方式对原来明文密码进行加密，前端提交的密码进行MD5加密后再跟数据库中密码比对

```java
//进行md5加密，然后再进行比对
password = DigestUtils.md5DigestAsHex(password.getBytes());
if (!password.equals(employee.getPassword())) {
    //密码错误
    throw new PasswordErrorException(MessageConstant.PASSWORD_ERROR);
}
```

### 4、新增员工接口

1、学习了接口的规范：管理端发出的请求，统一使用`/admin`作为前缀，用户端发出的请求，统一使用`/user`作为前缀

2、实体类可以通过BeanUtils工具类的对象属性拷贝方法，将DTO对象属性复制到Entity实体类上，实现数据传输对象(DTO)与实体类(Entity)的分离，简化了原来冗杂的赋值操作代码

```java
// 对象属性拷贝
BeanUtils.copyProperties(employeeDTO, employee);
```

3、解决看录入用户名已存在，抛出异常后没有处理，添加一个异常处理器将日志中的信息通过切片截取重复的用户名，抛出异常

```java
// 添加一个异常处理器
@ExceptionHandler
    public Result exceptionHandler(SQLIntegrityConstraintViolationException ex) {
        // Duplicate entry 'zhouxx' for key 'employee.idx_username'
        String message = ex.getMessage();
        if (message.contains("Duplicate entry")) {
            String[] split = message.split(" ");
            String username = split[2];
            String msg = username + MessageConstant.ALREADY_EXISTS;
            return Result.error(msg);
        } else {
            return Result.error(MessageConstant.UNKNOWN_ERROR);
        }
    }
```

**4、学习了TreadLocal局部变量**

+ TreadLocal为每一个线程提供一份单独的存储空间，具有线程隔离的效果，不同的线程之间不会相互干扰

+ 本项目定义了一个BaseContext工具类，使用TreadLocal的方法将解析后的员工id存储到TreadLocal中，并且在存储员工信息的实现类中，获取TreadLocal中的员工id并将其存储至Employee对象中。

```java
public class BaseContext {

    public static ThreadLocal<Long> threadLocal = new ThreadLocal<>();

    public static void setCurrentId(Long id) {
        threadLocal.set(id);
    }

    public static Long getCurrentId() {
        return threadLocal.get();
    }
    
    public static void removeCurrentId() {
        threadLocal.remove();
    }
}
```

### 5、员工分页查询接口

1、学会了使用mybatis的分页插件PageHelper来简化分页代码的开发，其底层基于mybatis拦截器实现

```java
// select * from employee limit ?,?; 动态拼接
PageHelper.startPage(employeePageQueryDTO.getPage(), employeePageQueryDTO.getPageSize());
```

2、在mapper的映射文件使用动态sql，它能在运行时自动解析和重写sql语句，为不同数据库添加正确的分页语法，实现无侵入式、数据库无关的自动分页功能

```java
<select id="pageQuery" resultType="com.sky.entity.Employee">
      select * from employee
          <where>
              <if test="name != null and name != ''">
                  and name like concat('%',#{name},'%')
              </if>
          </where>
      order by create_time desc
</select>
```

3、通过前后端联调以及返回的json格式数据，发现返回的时间是数组形式的，导致前端渲染格式效果不好

![image-20260427215233352](C:\Users\84113\AppData\Roaming\Typora\typora-user-images\image-20260427215233352.png)

![image-20260427215214878](C:\Users\84113\AppData\Roaming\Typora\typora-user-images\image-20260427215214878.png)

解决方式：

+ 方式一：在属性上加入注解，对日期进行格式化

  ```java
  @JsonFormat(patten = "yyyy-MM-dd HH:mm:ss")
  private LocalDateTime updateTime
  ```

+ 方式二：在WebMvcConfiguration 中扩展Spring MVC的消息转换器，统一对日期类型进行格式化处理

  ```java
  /**
   * 扩展mvc框架的消息转换器
   * @param converters
   */
  protected void extendMessageConverters(List<HttpMessageConverter<?>> converters) {
      log.info("开始扩展消息转换器...");
  
      //创建一个消息转化器对象
      MappingJackson2HttpMessageConverter converter = new MappingJackson2HttpMessageConverter();
      //设置对象转换器，可以将Java对象转为json字符串
      converter.setObjectMapper(new JacksonObjectMapper());
  
      //将我们自己的转换器放入spring MVC框架的容器中
      converters.add(0, converter);
  }
  ```

### 6、启用禁用员工账号

1、学习了使用构建器的方式创建对象

```java
// 原：
Employee employee = new Employee();
employee.setStatus(status);
employee.setId(id);

//构建器方式：
Employee employee = Employee.builder()
    	.status(status)
    	.id(id)
    	.build;
```

2、调试过程中出现了500报错，因为Mapper映射出现了语法错误(漏写了`update employee`开头)

##  杂项知识点

### 本地线程变量(TreadLocal)

+ `ThreadLocal` 是 Java 提供的线程局部变量工具类，其核心作用是 为每个线程创建独立的变量副本，实现线程间数据隔离。

+ 应用场景：在同一个线程/同一个请求中，进行数据共享。

+ TreadLocal的常用方法：

  | 方法                       | 描述                                 |
  | -------------------------- | ------------------------------------ |
  | `public void set(T value)` | 设置当前线程的线程局部变量的值       |
  | `public T get()`           | 返回当前线程所对应的线程局部变量的值 |
  | `public void remove()`     | 移除当前线程的线程局部变量           |

具体操作步骤：

1、定义`ThreadLocal`操作的工具类，比如本项目中的`BaseContext`类，用于操作当前员工的ID

```java
package com.sky.context;

public class BaseContext {

    public static ThreadLocal<Long> threadLocal = new ThreadLocal<>();

    public static void setCurrentId(Long id) {
        threadLocal.set(id);
    }

    public static Long getCurrentId() {
        return threadLocal.get();
    }

    public static void removeCurrentId() {
        threadLocal.remove();
    }
}
```

2、在`TokenFilter`中，解析完当前登录员工ID，将其存入`ThreadLocal`(用完之后需将其删除)。

## 总结：

今天是第一次进行单体项目的开发，切实地体会到了企业级项目和平常学习知识时做的demo的差距之大。最大的收获就是学习到了软件开发的许多流程与规范写法，然后还补充学习了许多Javaweb阶段没有学习到的设计方法，总之收获满满。相信在未来学习的日子里，能够收获满满~
