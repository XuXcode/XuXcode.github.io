---
title: Maven高级
date: 2025-12-19
categories:
  - Java
  - Javaweb
tags:
  - web/maven
  - Maven高级
  - 分模块
  - 聚合
  - 私服
---
# Maven高级

## 分模块设计与开发

### 分模块设计 

+ 将一个大项目拆分从若干个子模块，方便项目的管理维护、扩展，也方便模块间的相互引用，资源共享。

#### 策略

1、策略一：按照功能模块拆分，比如：公共组件、商品模块、购物车模块、订单模块等。

2、策略二：按层拆分，比如：公共组件、实体类、控制层、业务层、数据访问层。

3、策略三：按照功能模块+层拆分

+ 注意：分模块开发需要先针对模块功能进行设计，再进行编码。不会先将工程开发完毕，然后进行拆分。

## 继承与聚合

### 继承

+ 概念：继承描述的是两个工程间的关系，与Java中的继承相似，子工程可以继承父工程中的配置信息，常见于依赖关系的继承
+ 作用：简化依赖配置、统一管理依赖
+ 实现：`<parent>`...`</parent>`

#### 继承关系实现

1、创建maven模块项目名-parent，该工程为父工程，设置打包方式pom(默认jar)。

```xml
<packaging>pom</packaging>
```

> jar: 普通模块打包，springboot项目基本都是jar包（内嵌tomcat运行）
>
> war: 普通web程序打包，需要部署在外部的tomcat服务器中运行
>
> pom: 父工程或聚合工程，该模块不写代码，仅进行依赖管理

2、在子工程的pom.xml文件中，配置继承关系。

```xml
<!--父工程pom文件的相对路径-->
<relativePath>../parent/pom.xml</relativePath>
```

3、在父工程中配置各个工程共有的依赖(子工程会自动继承父工程的依赖)。

注意：

+ 在子工程中，配置了继承关系之后，坐标里面的groupId是可以省略的，因为会自动继承父工程的。
+ relativePath指定父工程的pom文件的相对位置(如果不指定，将从本地仓库/远程仓库查找)
+ 若父子工程都配置了同一个依赖的不同版本，以子工程的为准。

#### 版本锁定

+ 在Maven中，可以在父工程的pom文件中通过`<dependencyManagement>`来统一管理依赖版本

##### 自定义属性/引用属性

```xml
<!--自定义属性-->
<properties>
    <lombok.version>1.18.30</lombok.version>
    <jjwt.version>0.9.1</jjwt.version>
</properties>
```

```xml
<dependencies>
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <version>${lombok.version}</version>
    </dependency>
</dependencies>
```

### 聚合

+ 将多个模块组织成一个整体，同时进行项目的构建
+ 聚合工程：一个不具有业务功能的“空”工程(有且仅有一个pom文件)
+ 作用：快速构建项目(无需根据依赖关系手动构建，直接在聚合工程上构建即可)
+ 实现：maven中可以通过`<modules>`设置当前聚合工程所包含的子模块名称

```xml
<!--聚合-->
<modules>
    <module>../pojo</module>
    <module>../utils</module>
    <module>../web-management</module>
</modules>
```

+ 聚合工程中所包含的模块，在构建时，会自动根据模块间的依赖关系设置构建顺序，与聚合工程中模块的配置书写位置无关。

### 继承与聚合的联系与区别

+ 联系：继承与聚合都属于设计型模块，打包方式为pom，常将两种关系制作到同一个pom文件当中

+ 区别：

  1、继承用于简化依赖配置、统一管理依赖版本，是在子工程中配置继承关系

  2、聚合用于快速构建项目，是在父工程(聚合工程)中配置聚合的模块

## 私服

### 介绍

+ 私服是一种特殊的远程仓库，它是架设在局域网内的仓库服务，用来代理位于外部的中央仓库，用于解决团队内部的资源共享与资源同步问题

### 资源的上传与下载

**项目版本**：

+ RELEASE（发行版本）：功能趋于稳定、当前更新停止，可以用于发行的版本，存储在私服中的RELEASE仓库中
+ SNAPSHOT（快照版本）：功能不稳定、尚处于开发中的版本，即快照版本，存储在私服的SNAPSHOT仓库中。

## 🔗 相关链接

- [[Java/Javaweb/Maven|Maven 基础]] — 依赖管理、生命周期、JUnit
