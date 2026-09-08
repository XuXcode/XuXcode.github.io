---
title: 【苍穹外卖项目日记】Day4
date: 2026-08-14
description: 苍穹外卖项目实战日记第四天，使用 Redis 缓存菜品与套餐数据，并实现添加购物车功能。
categories:
  - Java
  - Java项目
  - 苍穹外卖
---
# 【苍穹外卖|项目日记】Day4

## 今日完成的任务

1、缓存菜品功能开发

2、缓存套餐功能开发(Spring Data Cache)

3、添加购物车代码实现

## 今日收获

### 1、学会使用Redis缓存数据

通过Redis缓存数据，减少数据库查询操作 

![image-20260808114724707](/img/苍穹外卖/image-20260808114724707.png)

#### 菜品缓存

缓存逻辑分析：

+ 每个分类下的菜品保存一份缓存数据
+ 数据库中菜品数据有变更时清理缓存数据

```java
public class DishController {
    @Autowired
    private DishService dishService;
	@Autowired
    private RedisTemplate redisTemplate;
    /**
     * 根据分类id查询菜品
     *
     * @param categoryId
     * @return
     */
    @GetMapping("/list")
    @ApiOperation("根据分类id查询菜品")
    public Result<List<DishVO>> list(Long categoryId) {
        //构造redis中的key，规则：dish_分类id
        String key =  "dish_" + categoryId;
        //查询Redis中是否存在菜品数据
        List<DishVO> list = (List<DishVO>) redisTemplate.opsForValue().get(key);
        if(list != null && list.size() > 0){
            //如果存在，直接返回，无须查询数据库
            return Result.success(list);
        }
        Dish dish = new Dish();
        dish.setCategoryId(categoryId);
        dish.setStatus(StatusConstant.ENABLE);//查询起售中的菜品

        list = dishService.listWithFlavor(dish);
        //如果不存在，查询数据库，将查询到的数据放入Redis中
        redisTemplate.opsForValue().set(key,list);
        return Result.success(list);
    }

}
```

#### 删除菜品缓存数据

场景：

+ 修改菜品数据
+ 删除菜品数据
+ 菜品的起售停售
+ 新增菜品数据

```java
/**
     * 新增菜品
     * @param dishDTO
     * @return
     */
    @PostMapping
    public Result save(@RequestBody DishDTO dishDTO){
        log.info("新增菜品：{}",dishDTO);
        dishService.saveWithFlavor(dishDTO);

        //清理缓存数据
        String key = "dish_" + dishDTO.getCategoryId();
        redisTemplate.delete(key);
        return Result.success();
    }
```

```java
private void cleanChache(String pattern){
        Set keys = redisTemplate.keys(pattern);
        redisTemplate.delete(keys);
}
```

### 2、使用Spring Cache缓存套餐

#### 实现思路

具体的实现思路如下：

- 导入`Spring Cache`和`Redis`相关maven坐标  
- 在启动类上加入`@EnableCaching`注解，开启缓存注解功能  
- 在用户端接口`SetmealController`的`list`方法上加入`@Cacheable`注解  
- 在管理端接口`SetmealController`的`save`、`delete`、`update`、`startOrStop`等方法上加入`CacheEvict`注解

### 3、添加购物车功能实现

+ 先通过TreadLocal获取当前线程的用户id
+ 判断购物车中的商品是否已经存在
+ 若存在，则++
+ 不存在，就判断一下是套餐的还是菜品的，然后再插入一条数量为1的购物车数据进入数据库

```java
@Service
@Slf4j
public class ShoppingCartServiceImpl implements ShoppingCartService {
    @Autowired
    private ShoppingCartMapper shoppingCartMapper;
    @Autowired
    private DishMapper dishMapper;
    @Autowired
    private SetmealMapper setmealMapper;

    @Override
    public void addShoppingCart(ShoppingCartDTO shoppingCartDTO) {
        //判断当前加入到购物车中的商品是否已经存在了
        ShoppingCart shoppingCart = new ShoppingCart();
        BeanUtils.copyProperties(shoppingCartDTO,shoppingCart);
        Long userId = BaseContext.getCurrentId();
        shoppingCart.setId(userId);

        List<ShoppingCart> list = shoppingCartMapper.list(shoppingCart);
        //如果已经存在了，只需要将数量加一
        if(list != null && list.size() > 0){
            ShoppingCart cart =  list.get(0);
            cart.setNumber(cart.getNumber() + 1);
            shoppingCartMapper.updateNumberById(cart);
        }else{
        //如果不存在，需要插入一条购物车数据1
            Long dishId = shoppingCartDTO.getDishId();
            if(dishId != null){
                //添加到购物车的是菜品
                Dish dish = dishMapper.getById(dishId);
                shoppingCart.setName(dish.getName());
                shoppingCart.setImage(dish.getImage());
                shoppingCart.setAmount(dish.getPrice());
            }else{
                //添加进来的是套餐
                Long setmealId = shoppingCartDTO.getSetmealId();
                Setmeal setmeal = setmealMapper.getById(setmealId);
                shoppingCart.setName(setmeal.getName());
                shoppingCart.setImage(setmeal.getImage());
                shoppingCart.setAmount(setmeal.getPrice());
            }
            shoppingCart.setNumber(1);
            shoppingCart.setCreateTime(LocalDateTime.now());
            shoppingCartMapper.insert(shoppingCart);
        }
    }
}

```

### 4、学会了如何设置默认地址

+ 先将当前用户的所有地址修改成默认地址
+ 然后再将当前的地址修改成默认地址

```java
@Transactional
    public void setDefault(AddressBook addressBook) {
        //1、将当前用户的所有地址修改为非默认地址 update address_book set is_default = ? where user_id = ?
        addressBook.setIsDefault(0);
        addressBook.setUserId(BaseContext.getCurrentId());
        addressBookMapper.updateIsDefaultByUserId(addressBook);

        //2、将当前地址改为默认地址 update address_book set is_default = ? where id = ?
        addressBook.setIsDefault(1);
        addressBookMapper.update(addressBook);
    } 
```

### 5、订单编号的生成

相较于原视频的时间戳生成订单号，在高并发场景下难免会导致有两个客户在同一ms下创建订单，导致订单号一样，视频中的时间戳方法不严谨，故使用Hutool中封装好的雪花算法方法生成订单号

```java
orders.setNumber(IdUtil.getSnowflakeNextIdStr());
```

### 6、微信支付功能

#### 微信小程序支付时序图

![image-20260814180249770](/img/苍穹外卖/image-20260814180249770.png)

JSAPI下单：商户系统调用该接口在微信支付服务后台生成**预支付交易单**

**请求 URL:** `https://api.mch.weixin.qq.com/v3/pay/transactions/jsapi`
**请求方式:** `POST`

```json
//预支付交易单
{
  "mchid": "1900006XXX",
  "out_trade_no": "1217752501201407033233368318",
  "appid": "wxdace645e0bc2cXXX",
  "description": "Image形象店-深圳腾大-QQ公仔",
  "notify_url": "https://www.weixin.qq.com/wxpay/pay.php",
  "amount": {
    "total": 1,
    "currency": "CNY"
  },
  "payer": {
    "openid": "o4GgauInH_RCEdvrrNGrntXDuXXX"
  }
}
```

## 杂项知识点

### Spring Cache

Spring Cache 是一个框架，实现了基于注解的缓存功能，只需要简单地加一个注解，就能实现缓存功能

Spring Cache提供了一层抽象，底层可以切换不同的缓存实现：

+ `EHCache`
+ `Caffeine`
+ `Redis`

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-cache</artifactId>
    <version>2.7.3</version>
</dependency>
```

#### 常用注解

| 注解             | 说明                                                         |
| ---------------- | ------------------------------------------------------------ |
| `@EnableCaching` | 开启缓存注解功能，通常加在启动类上                           |
| `@Cacheable`     | 在方法执行前先查询缓存中是否有数据，如果有数据，则直接返回缓存数据；如果没有缓存数据，调用方法并将方法返回值放到缓存中 |
| `@CachePut`      | 将方法的返回值放到缓存中                                     |
| `@CacheEvict`    | 将一条或多条数据从缓存中删除                                 |

#### **引导类上加@EnableCaching:**

```Java
package com.itheima;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@Slf4j
@SpringBootApplication
@EnableCaching//开启缓存注解功能
public class CacheDemoApplication {
    public static void main(String[] args) {
        SpringApplication.run(CacheDemoApplication.class,args);
        log.info("项目启动成功...");
    }
}
```

#### **@CachePut注解**

**@CachePut 说明：** 

​        作用: 将方法返回值，放入缓存

​        value: 缓存的名称, 每个缓存名称下面可以有很多key

​        key: 缓存的key  ----------> 支持Spring的表达式语言SPEL语法

**在save方法上加注解@CachePut**

当前UserController的save方法是用来保存用户信息的，我们希望在该用户信息保存到数据库的同时，也往缓存中缓存一份数据，我们可以在save方法上加上注解 @CachePut，用法如下：

```Java
    /**
     * CachePut：将方法返回值放入缓存
     * value：缓存的名称，每个缓存名称下面可以有多个key
     * key：缓存的key
     */
    @PostMapping
    @CachePut(value = "userCache", key = "#user.id")//key的生成：userCache::1
    public User save(@RequestBody User user){
        userMapper.insert(user);
        return user;
    }
```

**说明：**key的写法如下

`#user.id` : #user指的是方法形参的名称, id指的是user的id属性 , 也就是使用user的id属性作为key ;

`#result.id` : #result代表方法返回值，该表达式 代表以返回对象的id属性作为key ；

`#p0.id`：#p0指的是方法中的第一个参数，id指的是第一个参数的id属性,也就是使用第一个参数的id属性作为key ;

`#a0.id`：#a0指的是方法中的第一个参数，id指的是第一个参数的id属性,也就是使用第一个参数的id属性作为key ;

`#root.args[0].id`:`#root.args[0]`指的是方法中的第一个参数，id指的是第一个参数的id属性,也就是使用第一个参数

的id属性作为key ;

**启动服务,通过swagger接口文档测试，访问UserController的save()方法**

因为id是自增，所以不需要设置id属性

#### **@Cacheable注解**

**@Cacheable 说明:**

​        作用: 在方法执行前，spring先查看缓存中是否有数据，如果有数据，则直接返回缓存数据；若没有数据，调用方法并将方法返回值放到缓存中

​        `value`: 缓存的名称，每个缓存名称下面可以有多个key

​        `key`: 缓存的key  ----------> 支持Spring的表达式语言SPEL语法

 **在getById上加注解@Cacheable**

```Java
 /**
   *Cacheable：在方法执行前spring先查看缓存中是否有数据，如果有数据，则直接返回缓存数据；若没有数据，调用方法并将方法返回值放到缓存中
   * value：缓存的名称，每个缓存名称下面可以有多个key
   * key：缓存的key
 */
    @GetMapping
    @Cacheable(cacheNames = "userCache",key="#id")
    public User getById(Long id){
        User user = userMapper.getById(id);
        return user; 
```

#### **@CacheEvict注解**

**@CacheEvict 说明：** 

​        作用: 清理指定缓存

​        value: 缓存的名称，每个缓存名称下面可以有多个key

​        key: 缓存的key  ----------> 支持Spring的表达式语言SPEL语法

**在 delete 方法上加注解@CacheEvict**

```Java
@DeleteMapping
    @CacheEvict(cacheNames = "userCache",key = "#id")//删除某个key对应的缓存数据
    public void deleteById(Long id){
        userMapper.deleteById(id);
    }

        @DeleteMapping("/delAll")
    @CacheEvict(cacheNames = "userCache",allEntries = true)//删除userCache下所有的缓存数据
    public void deleteAll(){
        userMapper.deleteAll();
    }
```

### 雪花算法

**雪花算法**生成64位Long型唯一ID，结构如下：

- **1位**：符号位，固定为0（ID为正数）。
- **41位**：毫秒级时间戳，可用约 **69年**。
- **10位**：机器码（通常5位机房+5位机器），支持最多 **1024个**节点。
- **12位**：序列号，同一毫秒内每节点可生成 **4096个**不重复ID。

特点：全局唯一、趋势递增、高性能。通常作为独立服务部署，启动时分配10位机器码即可。

## 总结：

