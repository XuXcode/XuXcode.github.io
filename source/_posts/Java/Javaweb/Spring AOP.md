---
title: Spring AOP
date: 2025-12-19
description: 本文讲解 Spring AOP 面向切面编程，包括切入点、通知类型与底层动态代理原理。
categories:
  - Java
  - Javaweb
tags:
  - web/springboot
  - AOP
  - 切面
  - 切入点
  - ThreadLocal
---
# Spring AOP

## 什么是AOP

+ **AOP**：面向切面编程/面向方面编程，可简单理解为就是面向特定方法编程

+ 场景：
  - 记录系统的操作日志
  - 事务管理
  - 权限控制

+ 优点：

  1、减少重复代码

  2、代码无侵入

  3、提高开发效率

  4、维护方便

+ AOP是一种思想，Spring AOP则为该思想在Spring框架中对这种思想进行的实现

## AOP快速入门

+ 需求：统计所有业务方法的执行耗时

1、导入依赖

```xml
<dependency>
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

## AOP核心概念

+ **连接点：JoinPoint**，可以被AOP控制的方法(暗含方法执行时的相关信息)
+ **通知：Advice**，指那些重复的逻辑，也就是共性功能(最终体现为一个方法)
+ **切入点：PointCut**，匹配连接点的条件，通知仅会在切入点方法执行时被应用
+ **切面：Aspect**，描述通知与切入点的对应关系(通知+切入点)
+ **目标对象：Target**，通知所应用的对象

## AOP进阶

### 通知类型

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

#### @PointCut

+ 该注解的作用是将公共的切点表达式抽取出来，需要用到时引用该切点表达式即可。

```java
@Pointcut("execution(* com.itheima.service.impl.DeptServiceImpl.*(..))")
public void pt() {}

@Around("pt()")
public Object recordTime(ProceedingJoinPoint joinPoint) throws Throwable {
    // 方法体待补充
}
```

+ private：仅能在当前切面类中引用该表达式
+ public：在其他外部切面类中也可以引用该表达式

### 通知顺序

+ 当有多个切面的切入点都匹配到了目标方法，目标方法运行时，多个通知方法都会被执行。

+ 执行顺序：

  不同切面类中，默认按照切面类的类名字母排序：

  - 目标方法前的通知方法：字母排名靠前的先执行；
  - 目标方法后的通知方法：字母排名靠前的后执行。

+ 用`@Order(数字)`加在切面类上来控制顺序
  - 目标方法前的通知方法：数字小的先执行
  - 目标方法后的通知方法：数字小的后执行

### 切入点表达式

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

### 连接点

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


## ThreadLocal

+ ThreadLocal并不是一个Thread，而是Thread的局部变量。

+ TreadLocal为每一个线程提供一份单独的存储空间，具有线程隔离的效果，不同的线程之间不会相互干扰。

+ 应用场景：在同一个线程/同一个请求中，进行数据共享。

+ TreadLocal的常用方法：

  | 方法                       | 描述                                 |
  | -------------------------- | ------------------------------------ |
  | `public void set(T value)` | 设置当前线程的线程局部变量的值       |
  | `public T get()`           | 返回当前线程所对应的线程局部变量的值 |
  | `public void remove()`     | 移除当前线程的线程局部变量           |

具体操作步骤：

1、定义ThreadLocal操作的工具类，用于操作当前员工的ID

```java
package com.hut.utils;

public class CurrentHolder {

    private static final ThreadLocal<Integer> CURRENT_LOCAL = new ThreadLocal<>();

    public static void setCurrentId(Integer employeeId) {
        CURRENT_LOCAL.set(employeeId);
    }

    public static Integer getCurrentId() {
        return CURRENT_LOCAL.get();
    }

    public static void remove() {
        CURRENT_LOCAL.remove();
    }
}
```

2、在TokenFilter中，解析完当前登录员工ID，将其存入ThreadLocal(用完之后需将其删除)。

3、在AOP程序中，从ThreadLocal中获取当前登录员工的ID。

### 用一句话总结AOP：将与核心业务无关的代码独立的抽取出来，形成一个独立的组件，然后以横向交叉的方式应用到业务流程当中的过程

## 🔗 相关链接

- [[Java/Javase/动态代理|动态代理]] — AOP 底层实现原理（JDK 动态代理）
- [[Java/Javase/多线程&JUC|多线程 & JUC]] — ThreadLocal 与线程安全
- [[Java/Javaweb/Web基础|Web 基础]] — SpringBoot IOC & DI
- [[Java/Javaweb/Web后端实战|Web 后端实战]] — AOP 日志实战
