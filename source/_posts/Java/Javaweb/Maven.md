---
title: Maven
date: 2025-12-19
categories:
  - Java
  - Javaweb
tags:
  - web/maven
  - Maven
  - JUnit
---
# Maven

## 认识Maven

+ 一款用于管理和构建Java项目的工具，基于项目对象的概念，通过一小段描述信息来管理项目的构建。

### Maven的作用

+ **1、依赖管理**
  - 方便快捷的管理项目依赖的资源（jar包）

+ **2、项目构建**
  - 标准化跨平台的自动化项目管理方式

+ **3、统一项目结构**
  - 提供标准、统一的形目结构

### Maven概述

+ Maven的仓库是用来存储和管理jar包的
+ Maven仓库种类及查找依赖顺序：
  - 本地仓库(1)
  - 远程仓库(私服)(2)
  - 中央仓库(3)

### Maven坐标

+ 什么是坐标？
  - Maven中的坐标是资源(jar)的唯一表示，可以通过该坐标可以唯一定位资源的位置。
  - 使用坐标来定义项目或引入项目中需要的依赖。
+ Maven坐标主要组成：
  - groupId：定义当前Maven项目隶属组织名称(一般是域名反写，例如：com.hut)
  - artifactId：定义当前Maven项目名称(通常是模块名称，例如order-service、goods-service)
  - version：定义当前项目的版本号
    - SNAPSHOT：功能不稳定、尚处于开发中的版本，即快照版本
    - RELEASE：功能区域稳定、当前更新停止，可用于发行的版本

###  导入Maven项目

+ 将要导入的maven项目复制到项目目录下
+ 建议选择maven项目的pom.xml文件进行导入

## 依赖管理

### 依赖配置

- 依赖：指当前项目运行所需要的 jar 包，一个项目中可以引入多个依赖。
- 配置：
  1. 在 pom.xml 中编写 `<dependencies>` 标签
  2. 在 `<dependencies>` 标签中使用 `<dependency>` 引入坐标
  3. 定义坐标的 groupId，artifactId，version
  4. 点击刷新按钮，引入最新加入的坐标

### 排除依赖

+ 指主动断开依赖的资源，被排除的资源**无需指定版本**
+ 使用`<exclusions>`标签使用`<exclusion>`来排除依赖

### 生命周期

+ Maven的生命周期就是为了对所有的maven项目构建过程进行抽象和统一。

**Maven中有3套相互独立的生命周期**：

+ clean：清理工作
+ default：核心工作，如：编译、测试、打包、安装、部署等。
+ site：生成报告、发布站点等。

#### 生命周期的阶段

+ clean：移除上一次构建生成的文件

---

+ compile：编译项目源代码
+ test：使用适合的单元测试框架运行测试(junit)
+ package：将编译后的文件打包，如：jar、war等
+ install：安装项目到本地仓库

---

+ **注意：在同一套生命周期中，当运行后面的阶段时，前面的阶段都会运行**

## 单元测试

### 测试概述

+ 测试：是一种用来促进鉴定软件德正确性、完整性、安全性和质量的过程
+ 阶段划分：单元测试(白)、集成测试(灰)、系统测试(黑)、验收测试(黑)。

+ 测试方法：白盒测试、黑盒测试及灰盒测试

### 快速入门

+ 单元测试：就是针对最小的功能单元(方法)，编写测试代码对其正确性进行测试

+ JUnit：最流行的Java测试框架之一，提供了一些功能，方便程序进行单元测试(第三方公司提供)

### 使用JUnit，对业务方法进行单元测试步骤

+ 1、在pol.xml中，引入JUnit的依赖 

```xml
<dependency>
    <groupId>org.junit.jupiter</groupId>
    <artifactId>junit-jupiter</artifactId>
    <version>5.9.1</version>
</dependency>
```

+ 2、在test/java目录下，创建测试类，并编写对应的测试方法，并在方法上声明`@Test`注释 

+ **注意：JUnit单元测试类名命名规范为：XxxxxTest【规范】。Junit单元测试的方法，必须声明为 public void【规定】。**

### 断言

+ JUnit提供了一些辅助方法，用来帮我们确定被测试的方法是否按照预期的效果正常工作，这种方式称为**断言**。

| 断言方法                                                     | 描述                                       |
| ------------------------------------------------------------ | ------------------------------------------ |
| `Assertions.assertEquals(Object exp, Object act, String msg)` | 检查两个值是否相等，不相等就报错。         |
| `Assertions.assertNotEquals(Object unexp, Object act, String msg)` | 检查两个值是否不相等，相等就报错。         |
| `Assertions.assertNull(Object act, String msg)`              | 检查对象是否为 null，不为 null，就报错。   |
| `Assertions.assertNotNull(Object act, String msg)`           | 检查对象是否不为 null，为 null，就报错。   |
| `Assertions.assertTrue(boolean condition, String msg)`       | 检查条件是否为 true，不为 true，就报错。   |
| `Assertions.assertFalse(boolean condition, String msg)`      | 检查条件是否为 false，不为 false，就报错。 |
| `Assertions.assertThrows(Class<Exception> expType, Executable exec, String msg)` | 检查程序运行抛出的异常，是否符合预期。     |

+ 注意：上述方法形参中的最后一个参数msg，表示错误提示信息，可以不指定(有对应的重载方法)

### 常见注解

+ 在JUnit中还提供了一些注解，还增强其功能，常见的注解有一下几个：

| 注解                 | 说明                                                         | 备注                                |
| -------------------- | ------------------------------------------------------------ | ----------------------------------- |
| `@Test`              | 测试类中的方法用它修饰才能成为测试方法，才能启动执行         | 单元测试                            |
| `@ParameterizedTest` | 参数化测试的注解（可以让单个测试运行多次，每次运行时仅参数不同） | 用了该注解，就不需要 `@Test` 注解了 |
| `@ValueSource`       | 参数化测试的参数来源，赋予测试方法参数                       | 与参数化测试注解配合使用            |
| `@DisplayName`       | 指定测试类、测试方法显示的名称（默认为类名、方法名）         | -                                   |
| `@BeforeEach`        | 用来修饰一个实例方法，该方法会在每一个测试方法执行之前执行一次。 | 初始化资源（准备工作）              |
| `@AfterEach`         | 用来修饰一个实例方法，该方法会在每一个测试方法执行之后执行一次。 | 释放资源（清理工作）                |
| `@BeforeAll`         | 用来修饰一个静态方法，该方法会在所有测试方法之前只执行一次。 | 初始化资源（准备工作）              |
| `@AfterAll`          | 用来修饰一个静态方法，该方法会在所有测试方法之后只执行一次。 | 释放资源（清理工作）                |

### 企业开发规范

+ 原则：编写测试方法时，要尽可能堵塞覆盖业务方法中所有可能的情况(尤其是边界值)

### 依赖范围

+ 依赖的jar包，默认情况下，可以在任何地方使用。可以通过`<scope>`...`</scope>`设置其作用范围。

+ 作用范围：

  - 主程序范围范围有效(main文件夹范围内)
  - 测试程序范围有效(test文件夹范围内)
  - 是否参与打包运行(package指令范围内)

  | scope值         | 主程序 | 测试程序 | 打包（运行） | 范例        |
  | --------------- | ------ | -------- | ------------ | ----------- |
  | compile（默认） | Y      | Y        | Y            | log4j       |
  | test            | -      | Y        | -            | junit       |
  | provided        | Y      | Y        | -            | servlet-api |
  | runtime         | -      | Y        | Y            | jdbc驱动    |

---

```cmd
del /s *.lastUpdated
```

+ 批量删除`xxx.lastUpdated`文件
