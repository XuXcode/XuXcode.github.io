---
title: SpringBoot原理
date: 2025-12-19
categories:
  - Java
  - Javaweb
tags:
  - web/springboot
  - SpringBoot原理
  - Bean作用域
---
# SpringBoot原理

## 配置优先级

+ 支持三种格式的配置文件：

  `.properties`、`.yml`、`.yaml`

  （也是优先级顺序）

+ 注意：虽然springboot支持多种格式配置文件，但是在项目开发时，推荐使用一种格式的配置(yml是主流)

### 配置

+ SpringBoot 除了支持配置文件属性配置，还支持Java系统属性和命令行参数的方式进行属性配置。

  - Java系统属性（第二

    `-Dserver.port=9000`

  - 命令行参数（最高

    `--server.port=10010`

## Bean管理

### Bean的作用域

+ Spring支持五种作用域，后三种在web环境才生效

| 作用域      | 说明                                             |
| ----------- | ------------------------------------------------ |
| singleton   | 容器内同名称的 bean 只有一个实例（单例）（默认） |
| prototype   | 每次使用该 bean 时会创建新的实例（非单例/多例）  |
| request     | 每个请求范围内会创建新的实例（web环境中，了解）  |
| session     | 每个会话范围内会创建新的实例（web环境中，了解）  |
| application | 每个应用范围内会创建新的实例（web环境中，了解）  |

### 第三方Bean

## SpringBoot原理
