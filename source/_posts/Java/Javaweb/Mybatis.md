---
title: Mybatis
date: 2025-12-19
categories:
  - Java
  - Javaweb
tags:
  - web/mybatis
  - Mybatis
  - 持久层
  - 动态SQL
---
# Mybatis

+ MyBatis 是一款优秀的 持久层(dao) 框架，用于 简化JDBC 的开发

## 入门程序—使用Mybatis查询所有用户数据

+ **准备工作：**

  1、创建springboot工程、引入Mybatis相关依赖

  2、准备数据库表user、实体类User

  3、配置Mybatis(在application.properties中数据库连接信息)

  ```properties
  spring.datasource.url=jdbc:mysql://localhost:3306/web
  spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
  spring.datasource.username=root
  spring.datasource.password=1234
  mybatis.configuration.log-impl=org.apache.ibatis.logging.stdout.StdOutImpl
  ```

+ **编写Mybatis程序**：编写Mybatis的持久层接口，定义SQL(注解/XML)

  ```java
  @Mapper //应用程序在运行时，会自动的为该接口创建一个实现类对象(代理对象)，并且会自动将实现类对象存入IOC容器->bean
  public interface UserMapper {
      @Select("select * from user")
      public List<User> findAll();
  }
  ```

> 提示：Mybatis的持久层接口命名规范为 XxxMapper，也称为 Mapper接口

+ 控制台输出log：`mybatis.configuration.log-impl=org.apache.ibatis.logging.stdout.StdOutImpl`

## 数据库连接池

+ **数据库连接池**是个容器，负责分配、管理数据库连接(Connection)

+ 它允许应用程序重复使用一个现有的数据库连接，而不是再重新建立一个

+ 释放空闲时间超过最大空闲时间的连接，来避免因为没有释放连接而引起的数据库连接遗漏

+ 优势：

  1、资源重用

  2、提升系统响应速度

  3、避免数据库连接漏洞

+ 标准接口：`DataSource`

  - 官方提供的数据库连接池接口，有第三方组织实现此接口
  - 功能：获取连接 `Connection getConnection() throws SQLException;`

+ 常见产品：

  - Druid (Alibaba)

    - 切换数据库连接池：

      ```xml
      <dependency>
          <groupId>com.alibaba</groupId>
          <artifactId>druid-spring-boot-starter</artifactId>
          <version>1.2.19</version>
      </dependency>
      ```

      ```properties
      spring.datasource.type=com.alibaba.druid.pool.DruidDataSource
      ```

  - Hikari (SpringBoot默认)

## 增删改查操作

### 删除用户-delete

+ 需求：根据ID删除用户信息

+ SQL：`delete from user where id = 5;`

+ Mapper接口：

  ```java
  @Delete("delete from user where id = #{id}")
  public void deleteById(Integer id);
  ```

+ Mybatis中的#号和$号：

  | 符号     | 说明                                                     | 场景                       | 优缺点               |
  | -------- | -------------------------------------------------------- | -------------------------- | -------------------- |
  | `#{...}` | 占位符。执行时，会将 `#{...}` 替换为 `?`，生成预编译 SQL | 参数值传递                 | 安全、性能高（推荐） |
  | `${...}` | 拼接符。直接将参数拼接在 SQL 语句中，存在 SQL 注入问题   | 表名、字段名动态设置时使用 | 不安全、性能低       |

### 新增用户-insert

+ 需求：添加一个用户

+ SQL：`insert into user(username,password,name,age) value('lbj','123456','乐邦',41)`

+ Mapper接口：

  ```java
  @Insert("insert into user(username,password,name,age) value(#{username},#{password},#{name},#{age})")
  public void insert(User user);
  ```

### 修改用户-update

+ 需求：根据ID更新用户信息

+ SQL：`update user set username = 'kobe' , password = '123456 , name = '科比牢大', age = 41 where id = 8;`

+ Mapper接口：

  ```java
  @Update("update user set username=#{username}, password=#{password}, name=#{name}, age=#{age} where id=#{id}")
  public void update(User user);
  ```

### 查询用户-select

+ 需求：跟据用户名和密码查询用户信息

+ SQL：`select * from user where username = 'lbj' and password = '123456'`

+ Mapper接口：

  ```java
  @Select("select * from user where username=#{username} and password=#{password}")
  public User findByUsernameAndPassword(@Param("username")String username, @Param("password") String password);
  ```

> @Param注解的作用是为接口的方法形参起名字的。

+ 说明：基于官方骨架创建的springboot项目中，接口编译时会保留方法形参名，`@Param`注解可以省略

## XML映射操作

+ 在Mybatis中，既可以通过注解配置SQL语句，也可以通过XML配置文件配置SQL语句。

+ 默认规则：

  1、XML映射文件的名称与Mapper接口一致，并且将XML映射文件和Mapper接口放置在相同包下**(同包同名)**。

  2、XML映射文件的namespace属性为Mapper接口全限定名一致。

  3、XML映射文件中sql语句的id与Mapper接口中的方法名一致，并保持返回类型一致。

```java
@Mapper
public interface UserMapper{
    public List<User> findAll();
}
```

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
        PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.hut.mapper.UserMapper">
     <select id="findAll" resultType="com.hut.pojo.User">
         select id,username,password,name,age from user
     </select>
</mapper>
```

+ 使用注解来映射简单语句会使代码显得更加简洁，但对于稍微复杂一点的语句，Java 注解不仅力不从心，还会让你本就复杂的 SQL 语句更加混乱不堪。 因此，如果你需要做一些很复杂的操作，最好用 XML 来映射语句。

  选择何种方式来配置映射，以及认为是否应该要统一映射语句定义的形式，完全取决于你和你的团队。 换句话说，永远不要拘泥于一种方式，你可以很轻松的在基于注解和 XML 的语句映射方式间自由移植和切换。

### 辅助配置

+ 配置XML映射文件的位置(自己指定)

  ```properties
  mybatis.mapper-locations=classpath:mapper/*.xml
  ```

+ 借助 MybatisX 插件

### 动态SQL

+ 随着用户的输入或外部条件的变化而变化的SQL语句，我们称为 **动态SQL** 。

+ `<if>`：判断条件是否成立，如果条件为true，则拼接SQL 。

  ```xml
  <if test="gender!=null">
      and e.gender = #{gender}
  </if>
  ```

  ```xml
  <select id="list" resultType="com.itheima.pojo.Emp">
      SELECT e.*, d.name AS deptName FROM emp e LEFT JOIN dept d ON e.dept_id = d.id
      where
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
  </select>
  ```

+ `<where>`：根据查询条件，来生成where关键字，并会自动去除条件前面多余的and或or。

## 🔗 相关链接

- [[Java/Javaweb/MySQL|MySQL]] — SQL 基础
- [[Java/Javaweb/Web基础|Web 基础]] — SpringBoot + 三层架构
- [[Java/Javaweb/Web后端实战|Web 后端实战]] — Mybatis 实战应用
