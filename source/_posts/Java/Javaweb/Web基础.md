---
title: Web基础
date: 2025-12-19
categories:
  - Java
  - Javaweb
tags:
  - web/springboot
  - web/http
  - Web基础
  - HTTP
  - IOC
  - DI
---
# Web基础

## SpringBootWeb入门程序

+ 创建springboot工程，并勾选web开发相关依赖
+  定义请求处理类HelloController，添加方法hello，并添加注解

```java
@RestController //表示当前类是一个请求处理类
public class HelloController {
    @RequestMapping("/hello") //表示该方法处理/hello请求
    public String hello(String name){
        System.out.println("name:"+name);
        return "hello "+name+"~";
    }
}
```

## SpringBoot官方脚手架连接不上解决方案

+ 魔法科学上网
+ 镜像：`start.aliyun.com`(版本较旧)

## HTTP协议

### 认识HTTP协议

+ 超文本传输协议，规定了浏览器和服务器之间数据传输的规则

+ 特点：
  - 1、基于TCP协议：面向连接，安全
  - 2、基于请求-响应模型的：一次请求对应一次响应
  - 3、HTTP协议是无状态的协议：对于事务处理没有记忆能力。每次请求-响应都是独立的
    - 缺点：多次请求间不能共享数据。
    - 优点：速度快

### HTTP-请求协议

#### 请求数据格式

+ 请求行：请求数据第一行(请求方式、资源路径、协议)

  - 常用请求方式：**GET(请求指定的资源)、POST(向指定资源提交数据进行处理)**

+ 请求头：第二行开始，可是Key：value

  | 请求头字段        | 说明                                                         |
  | ----------------- | ------------------------------------------------------------ |
  | `Host`            | 请求的主机名                                                 |
  | `User-Agent`      | 浏览器版本，例如 Chrome 浏览器的标识类似 `Mozilla/5.0 ... Chrome/79`，IE 浏览器的标识类似 `Mozilla/5.0 (Windows NT ...) like Gecko` |
  | `Accept`          | 表示浏览器能接收的资源类型，如 `text/*`、`image/*` 或者 `*/*` 表示所有 |
  | `Accept-Language` | 表示浏览器偏好的语言，服务器可以据此返回不同语言的网页       |
  | `Accept-Encoding` | 表示浏览器可以支持的压缩类型，例如 `gzip`、`deflate` 等      |
  | `Content-Type`    | 请求主体的数据类型                                           |
  | `Content-Length`  | 请求主体的大小（单位：字节）                                 |

+ 请求体(与请求头之间隔了一个空行)：POST请求，存放请求参数
+ **请求方式—GET：**请求参数在请求行中，没有请求体，如：/brand/findAll?name=OPPO&status=1 GET请求大小在浏览器中是有限制的
+ **请求方式—POST：**请求参数在请求体中，POST请求大小是没有限制的

#### 请求数据获取

+ Web服务器(Tomcat)对HTTP协议的请求数据进行解析，并进行了封装(HttpServletRequest)，在调用Controller方法的时候传递给了改方法。这样，就是使得程序员不必直接对协议进行操作，让Web开发更加便捷

```java
@RequestMapping("/request")
public String request(HttpServletRequest request){
    // 1.获取请求参数name, age
    String name = request.getParameter("name"); // Tom
    
    // 2.获取请求路径uri 和 url
    String uri = request.getRequestURI(); // /request
    String url = request.getRequestURL().toString(); // http://localhost:8080/request
    
    // 3.获取请求头 User-Agent
    String userAgent = request.getHeader("User-Agent"); // Mozilla/5.0 (Windows NT 10.0; Win64; x64)
    
    // 4.获取请求方式
    String method = request.getMethod(); // GET
    
    // 5.获取请求的查询字符串
    String queryString = request.getQueryString(); // name=Tomcat&age=10
    //6、获取请求协议
    String protocol = request.getProtocol();
    System.out.println("请求协议："+ protocol);
    
    return "request success";
}
```

### HTTP协议-响应协议

#### 响应数据格式

+ 响应行：响应数据第一行(协议、状态码、描述)

  | 状态码 | 说明                                                         |
  | ------ | ------------------------------------------------------------ |
  | 1xx    | 响应中-临时状态码，表示请求已经接收，告诉客户端应该继续请求或者如果它已经完成则忽略它。 |
  | 2xx    | 成功-表示请求已经被成功接收，处理已完成。                    |
  | 3xx    | 重定向-重定向到其他地方；让客户端再发起一次请求以完成整个处理。 |
  | 4xx    | 客户端错误-处理发生错误，责任在客户端。如：请求了不存在的资源、客户端未被授权、禁止访问等。 |
  | 5xx    | 服务器错误-处理发生错误，责任在服务端。如：程序抛出异常等。  |

+ 响应头：第二行开始，格式key：value

  | 响应头           | 说明                                                         |
  | ---------------- | ------------------------------------------------------------ |
  | Content-Type     | 表示该响应内容的类型，例如text/html，application/json。      |
  | Content-Length   | 表示该响应内容的长度（字节数）。                             |
  | Content-Encoding | 表示该响应压缩算法，例如gzip。                               |
  | Cache-Control    | 指示客户端应如何缓存，例如max-age=300表示可以最多缓存300秒。 |
  | Set-Cookie       | 告诉浏览器为当前页面所在的域设置cookie。                     |

+ 响应体(空行)：最后一部分，存放响应数据

#### 响应数据设置

+ Web服务器对HTTP协议的响应数据进行了封装(HttpServletResponse)，并在调用Controller方法的时候传递给了该方法。这样，就使得程序员不必直接对协议进行操作，让Web开发更便捷

```java
//1、方式一：基于HttpServletResponse封装
@RequestMapping("/response")
public void response(HttpServletResponse response) throws IOException {
    // 1.设置响应状态码
    response.setStatus(401);
    // 2.设置响应头
    response.setHeader("itheima", "itheima");
    // 3.设置响应体
    response.getWriter().write("<h1>Hello Response</h1>");
}
//2、基于ResponseEntity封装
@RequestMapping("/response")
public ResponseEntity<String> response() {
    return ResponseEntity.status(401) //1、设置响应状态码
                         .header("group", "itcast") //2、设置响应头
                         .body("<h1>Hello Response</h1>"); //3、设置响应体
}
```

+ **注意：**响应状态码和响应头如果没有特殊要求的化，通常不手动设定。服务器会跟据请求处理的逻辑，自动设置响应状态码和响应头

## 分层解耦

+ 耦合：衡量软件中各个层/各个模块的依赖关联程度
+ 内聚：软件中各个功能模块内部的功能联系

### 三层架构

+ Controller：控制层，接受前端发送的请求，对请求进行处理，并响应数据
+ Service：业务逻辑层，处理具体的业务逻辑

+ Dao：数据访问层(Data Access Object)（持久层），负责数据访问操作，包括增删查改

### 控制反转(IOC)

+ 对象的创建控制权有程序自身转移到外部(容器)，这种思想称为控制反转。

### 依赖注入(DI)

+ 容器为应用程序提供运行时，所依赖的资源，称之为依赖注入。

### Bean对象

+ IOC容器中创建、管理的对象，称之为**Bean**。

### 实现分层解耦的思路

+ 将项目中的类交给IOC容器管理

  - `@Componet`：将当前实现类类交给IOC容器管理

  - `@Autowired`：应用程序运行时，会自动的查询该类型的bean对象，并赋值给该成员变量

+ 应用程序运行时需要说明对象，直接依赖容器为其提供

### IOC & DI 入门

+ 1、将Dao & Service层的实现类交给IOC容器管理
+ 2、为Controller 及 Service注入运行时所依赖的对象

### IOC详解

+ 要把某个对象交给IOC容器管理，需要在对应的类加上如下注解之一：

| 注解          | 说明                    | 位置                                                |
| ------------- | ----------------------- | --------------------------------------------------- |
| `@Component`  | 声明 bean 的基础注解    | 不属于以下三类时，用此注解                          |
| `@Controller` | `@Component` 的衍生注解 | 标注在控制层类上                                    |
| `@Service`    | `@Component` 的衍生注解 | 标注在业务层类上                                    |
| `@Repository` | `@Component` 的衍生注解 | 标注在数据访问层类上（由于与 MyBatis 整合，用的少） |

+ 注意：声明bean的时候，可以通过注解的value属性指定bean的名字，如果没有指定，默认为类名首字母的小写

- 前面声明 bean 的四大注解，要想生效，还需要被组件扫描注解 `@ComponentScan` 扫描。

+ 该注解虽然没有显式配置，但是实际上已经包含在了启动类声明注解 `@SpringBootApplication` 中，默认扫描的范围是启动类所在包及其子包。

### DI详解

+ 基于`@Autowired`进行依赖注入的常见方式有如下三种：

```java
//1、属性注入
@RestController
public class UserController {
    @Autowired
    private UserService userService;
    // ......
}
```

+ 优点：代码简洁、方便快速开发。
+ 缺点：隐藏了类之间的依赖关系、可能会破坏类的封装性。

```java
//2、构造函数注入（推荐使用）
@RestController
public class UserController {
    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }
}
```

+ 优点：能清晰地看到类的依赖关系、提高了代码的安全性。
+ 缺点：代码繁琐、如果构造参数过多，可能会导致构造函数臃肿。
+ 注意：如果只有一个构造函数，`@Autowired`注解可以省略

```java
//3、setter注入
@RestController
public class UserController {
    private UserService userService;

    @Autowired
    public void setUserService(UserService userService) {
        this.userService = userService;
    }
}
```

+ 优点：保持类的封装性，依赖关系更清晰
+ 缺点：需要额外编写setter方法，增加了代码量

---

- 推荐优先使用 **构造函数注入**（更安全、可测试性强）。
- 在需要可选依赖时可考虑 **Setter 注入**。
- 尽量避免使用 **属性注入**（除非是简单测试场景）。

---

`@Autowired`注解，默认时按照**类型**进行注入的，如果存在多个相同类型的bean，将会报错

解决方案：

+ 方案一：@Primary（推荐用于默认实现）
  ```java
  @Service
  @Primary
  public class UserServiceImpl implements UserService {
      @Override
      public List<User> list() {
          // 省略......
      }
  }
  ```

  - 说明：当存在多个 UserService 实现类时，使用 @Primary 标记其中一个作为默认优先注入的实现。适用于只有一个主实现的情况。

+ 方案二：@Qualifier（指定具体实现名称）
  ```java
  @RestController
  public class UserController {
      @Autowired
      @Qualifier("userServiceImpl")
      private UserService userService;
  }
  ```

  - 通过 `@Qualifier("beanName")` 明确指定要注入的 Bean 名称（默认是类名首字母小写）。适用于需要精确控制注入哪一个实现的场景。

+ 方案三：`@Resource`（JNDI 风格，自动按名称匹配）

  ```java
  @RestController
  public class UserController {
      @Resource(name = "userServiceImpl")
      private UserService userService;
  }
  ```

  - `@Resource` 是 Java EE 提供的注解，默认按名称（`name` 属性）查找 Bean，不依赖 Spring 的 `@Autowired` 机制。若未指定 `name`，则默认使用字段名作为 Bean 名称。

---

| 方案         | 是否支持自定义名称 | 是否属于 Spring | 推荐程度                    |
| ------------ | ------------------ | --------------- | --------------------------- |
| `@Primary`   | ❌ 不支持           | ✅ 是            | ⭐⭐⭐⭐（适合默认实现）        |
| `@Qualifier` | ✅ 支持             | ✅ 是            | ⭐⭐⭐⭐⭐（最灵活）             |
| `@Resource`  | ✅ 支持             | ⚠️ 兼容 JNDI     | ⭐⭐⭐（通用但非 Spring 特有） |

## 🔗 相关链接

- [[Java/Javaweb/MySQL|MySQL]] — 数据库基础
- [[Java/Javaweb/Mybatis|Mybatis]] — 持久层框架
- [[Java/Javaweb/Spring AOP|Spring AOP]] — 面向切面编程
- [[Java/Javaweb/SpringBoot原理|SpringBoot 原理]] — Bean 管理
- [[Java/Javaweb/Web后端实战|Web 后端实战]] — 三层架构实战
