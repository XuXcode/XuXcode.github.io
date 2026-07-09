---
title: SpringBoot配置文件
date: 2025-12-19
categories:
  - Java
  - Javaweb
tags:
  - web/springboot
  - SpringBoot配置
  - yml
  - properties
---
# SpringBoot配置文件

## 配置文件格式

+ SpringBoot项目提供了多种属性配置方式(properties、yaml、yml)

## yml配置文件

+ 格式：
  - 数值前边必须有空格，作为分隔符
  - 使用缩进表示层级关系，缩进时，不允许使用Tab键，只能用空格(idea中会自动将Tab转换成空格)
  - 缩进的空格数目不重要，只要相同层级的元素左侧对齐即可
  - `#`表示注释，从这个字符一直到行尾，都会被解析器忽略

```yml
#配置服务器相关信息
server:
  port: 8080
  address: 127.0.0.1
```

+ 定义对象/Map集合：

  ```yml
  user:
    name: 张三
    age: 18
    password: 123456
  ```

+ 定义数组/List/Set集合

  ```yml
  hobby:
    - java
    - game
    - sport
  ```

> 注意：在yml格式的配置文件中，如果配置项的值是以 0 开头的，值需要使用 ' ' 引起来，因为以0开头在yml中表示8进制的数据

## 🔗 相关链接

- [[Java/Javaweb/SpringBoot原理|SpringBoot 原理]] — 配置优先级、Bean 管理
