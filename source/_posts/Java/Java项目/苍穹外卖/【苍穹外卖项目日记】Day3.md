---
title: 【苍穹外卖项目日记】Day3
date: 2026-08-08
description: 苍穹外卖项目实战日记第三天，学习 Redis 基础与配置，并实现店铺营业状态设置和微信小程序登录接口。
categories:
  - Java
  - Java项目
  - 苍穹外卖
---
# 【苍穹外卖|项目日记】Day3

## 今日完成的任务：

1、学习了Redis基础知识点并配置

2、实现了店铺营业状态设置接口功能

3、微信小程序登录功能接口实现

## 今日收获：

### 1、学习了Redis的部分语法

#### 字符串操作命令

Redis字符串类型常用命令：

+ `SET ket value` 设置指定key的值
+ `GET key` 获取指定key的值
+ `SETEX key seconds value` 设置指定key的值，并将key的过期时间设为seconds秒
+ `SETN key value` 只有在key不存在时设置key的值

#### 哈希操作命令

![image-20260806131002181](/img/苍穹外卖/image-20260806131002181.png)

Redis hash 是一个string类型 的field 和 value的映射表，hash特别适合用于存储对象，常用命令：

+ `HSET key field value` 将哈希表key中的字段field的值设为value
+ `HGET key field` 获取存储在哈希表中指定字段的值
+ `HDEL key field` 删除存储在哈希表中的指定字段
+ `HKEYS key` 获取哈希表中所有字段
+ `HVALS key` 获取哈希表中所有值

#### 列表操作命令

Redis列表时简单的字符串列表，按照插入顺序排序，常用命令：

+ `LPUSH key value1 [value2]` 将一个或多个值插入到列表头部
+ `LRANGE key start stop` 获取列表指定范围内的元素
+ `RPOP key` 移除并获取列表中最后一个元素
+ `LLEN key` 获取列表的长度 

#### 集合操作命令

Redis set 是string类型的无序集合。集合成员是**唯一的**，集合中不能出现重复的数据，常用命令：

+ `SADD key member1 [member2]` 向集合添加一个或多个成员
+ `SMEMBERS key` 返回集合中的所有成员
+ `SCARD key` 获取集合的成员数
+ `SINTER key1 [key2]` 返回给定所有集合的交集
+ `SUNION key1 [key2]` 返回所有给定集合的并集
+ `SREM key member1 [member2]` 删除集合中一个或多个成员

#### 有序集合操作命令

![image-20260806141234536](/img/苍穹外卖/image-20260806141234536.png)

Redis有序集合是string类型元素的集合，且不允许有重成员。每个元素都会关联一个double类型的分数

+ `ZADD key score1 member1 [score2 member2]` 向有序集合添加一个或多个成员
+ `ZRANGE key start stop [WITHSCORES]` 通过索引区间向返回有序集合中指定区间内的成员、
+ `ZINCRBY key increment member` 有序集合中对指定成员的分数加上增量increment
+ `ZREM key member [member...]` 移除有序集合中的一个或多个成员

#### 通用命令

 Redis的通用命令是不分数据类型的，都可以使用的命令：

+ `KEYS pattern` 查找所有符合给定模式（pattern）的key
+ `EXISTS key` 检查给定key是否存在
+ `TYPE key` 返回key存储的值的类型
+ `DEL key` 该命令用于在key 存在是删除 key

### 2、在Java中操作Redis——Spring Data Redis

操作步骤：
1、导入Spring Data Redis 的maven坐标

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
```

2、配置Redis数据源

```yml
spring:
  redis:
    host: localhost
    port: 6379
    password: 123456
```

3、编写配置类，创建RedisTemplate对象

```java
@Configuration
@Slf4j
public class RedisConfiguration {

    @Bean
    public RedisTemplate redisTemplate(RedisConnectionFactory redisConnectionFactory) {
        log.info("开始创建redis模板类...");
        RedisTemplate redisTemplate = new RedisTemplate();
        // 设置key的序列化器，默认为dkSerializationRedisSerializer
        redisTemplate.setKeySerializer(new StringRedisSerializer());
        redisTemplate.setConnectionFactory(redisConnectionFactory);
        return redisTemplate;
    }
}
```

4、通过RedisTemplate对象操作Redis

### 3、微信小程序登录功能实现

官方文档地址：[开放能力 / 用户信息 / 小程序登录](https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/login.html)

**核心：**获取到用户唯一标识openid，可以通过调用HttpClient的doGET方法(先将发送请求过去的请求体通过map格式进行封装)，获取到微信服务器返回的json数据，再通过JSONobject对象将返回的的json对象调用getString方法，传入openid的键获取到具体的openid的值

```java
@RestController
@RequestMapping("/user/user")
@Slf4j
public class UserController {
    @Autowired
    private UserService userService;

    @Autowired
    private JwtProperties jwtProperties;
    /**
     * 微信登录
     * @param userLoginDTO
     * @return
     */
    @PostMapping("/login")
    public Result<UserLoginVO> login(@RequestBody UserLoginDTO userLoginDTO){
        log.info("微信用户登录：{}",userLoginDTO.getCode());
        User user = userService.wxLogin(userLoginDTO);
        //为微信用户生成jwt令牌
        Map<String,Object> claims = new HashMap<>();
        claims.put(JwtClaimsConstant.USER_ID,user.getId());
        String token = JwtUtil.createJWT(jwtProperties.getUserSecretKey(),jwtProperties.getUserTtl(),claims);

        UserLoginVO userLoginVO = UserLoginVO.builder()
                .id(user.getId())
                .openid(user.getOpenid())
                .token(token)
                .build();
        return Result.success(userLoginVO);
    }
```

```java
/**
     * 调用微信接口服务，获取当前微信用户的openid
     * @param code
     * @return
     */
    private String getOpenid(String code){
        Map<String,String> map = new HashMap<>();
        map.put("appid", weChatProperties.getAppid());
        map.put("secret", weChatProperties.getSecret());
        map.put("js_code",code);
        map.put("grant_type","authorization_code");
        String json = HttpClientUtil.doGet(WX_LOGIN,map);

        JSONObject jsonObject = JSONObject.parseObject(json);
        String openid = jsonObject.getString("openid");

        return openid;
    }
```

## 杂项知识点：

### Redis入门

Redis是一个基于内存的`key-value`结构数据库

+ 基于内存存储，读写性能高
+ 适合存储热点数据（热点商品、资讯、新闻）

### Redis数据类型

#### 5种常用的数据类型介绍

Redis存储的是key-value结构的数据，其中key是字符串数据，value有5种常用的数据类型：

+ 字符串 String
+ 哈希 hash
+ 列表 list
+ 集合 set
+ 有序集合 sorted set / zset

#### 各种数据类型的特点

+ 字符串(string)：普通字符串，Redis种最简单的数据类型
+ 哈希(hash)：也叫散列，类似于Java中的HashMap结构
+ 列表(list)：按照插入顺序排序，可一有重复元素，类似于Java中的LinkedList
+ 集合(set)：无序集合，没有重复元素，类似于Java中的HashSet
+ 有序集合(sorted set / zset)：集合中每个元素关联一个分数(score)，跟据分数升序排序与，没有重复元素

#### Redis的Java客户端

Redis的Java客户端很多，常用的几种：

+ Jedis
+ Lettuce
+ Spring Data Redis：spring的一部分，对Redis底层开发包进行了高度封装。在spring项目中，可以使用Spring Data Redis来简化操作。

### HttpClient

HttpClient 是Apache Jakarta Common 下的子项目，可以用来提供高效的、最新的、功能丰富的支持 HTTP 协议的客户端编程工具包，并且它支持 HTTP 协议最新的版本和建议。

```xml
<dependency>
    <groupId>org.apache.httpcomponents</groupId>
    <artifactId>httpclient</artifactId>
    <version>4.5.13</version>
</dependency>
```

核心API：

- HttpClient
- HttpClients
- CloseableHttpClient
- HttpGet
- HttpPost

发送请求步骤：

+ 创建HttpClient对象
+ 创建Http请求对象
+ 调用HttpClient的execute方法发送请求

## 总结：

今天学习到了一种新的数据库类型，也就是通过内存存储一些高访问或只有一条字段的数据，这样可以减少SQL语句的使用，减少对于硬盘文件的读写，提高项目的性能。也入门了微信小程序开发，了解学习到了微信小程序开发的流程。相比于之前的重复CRUD，今天的内容让我收获满满。
