---
title: 【苍穹外卖项目日记】Day5
date: 2026-08-28
description: 苍穹外卖项目实战日记第五天，使用 Spring Task 定时处理订单状态，并基于 WebSocket 实现来单提醒与客户催单。
categories:
  - Java
  - Java项目
  - 苍穹外卖
---
# 【苍穹外卖|项目日记】Day5

## 今日完成的任务

1、了解学习了Spring Task的用法

2、运用Spring Task完成了订单状态定时处理的业务功能

3、了解学习WebSocket的使用

4、来单提醒功能的开发

5、客户催单功能的开发

## 今日收获

### 1、订单状态定时处理代码实现

+ 通过定时任务**每分钟检查一次**是否存在支付超时订单（下单后超过15分钟仍未支付则判定为支付超时订单），如果存在则修改订单状态为”已取消“

  ```java
  /**
   * 定时任务类，定时处理订单状态
   */
  @Component
  @Slf4j
  public class MyTask {
      @Autowired
      private OrderMapper orderMapper;
      /**
       * 处理超时订单的方法
       */
      @Scheduled(cron = "0 * * * * *")
      public void processTimeoutOrder(){
          log.info("定时处理超时订单：{}", LocalDateTime.now());
          LocalDateTime time = LocalDateTime.now().minusMinutes(15); //-15分钟
          List<Orders> ordersList = orderMapper.getByStatusAndOrdersTimeLT(Orders.PENDING_PAYMENT, time);
  
          if(ordersList != null && ordersList.size() > 0){
              for (Orders orders : ordersList) {
                  orders.setStatus(Orders.CANCELLED);
                  orders.setCancelReason("订单超时，自动取消");
                  orders.setCancelTime(LocalDateTime.now());
                  orderMapper.update(orders);
              }
          }
      }
  }
  ```

  ```java
  /**
       * 跟据订单状态和下单时间查询订单
       * @param status
       * @param orderTime
       * @return
       */
      @Select("select * from orders where status = #{status} and order_time < #{orderTime}")
      List<Orders> getByStatusAndOrdersTimeLT(Integer status, LocalDateTime orderTime);
  ```

+ 通过定时任务**每天凌晨1点检查一次**是否存在“派送中”的订单，如果存在则修改订单状态为“已完成”

### 2、来单提醒与客户催单业务功能实现

* 通过WebSocket实现管理端页面和服务端保持长连接状态
* 当客户支付后，调用WebSocket的相关API实现服务端向客户端推送消息
* 客户端浏览器解析服务端推送的消息，判断是来单提醒还是客户催单，进行相应的消息提示和语音播报
* 约定服务端发送给客户端浏览器的数据格式为JSON，字段包括：type, orderId, content
  - type 为消息类型，1为来单提醒 2为客户催单
  - orderId 为订单id
  - content 为消息内容

```java
Map map = new HashMap();
        map.put("type", 1);//消息类型，1表示来单提醒
        map.put("orderId", orders.getId());
        map.put("content", "订单号：" + outTradeNo);

        //通过WebSocket实现来单提醒，向客户端浏览器推送消息
        webSocketServer.sendToAllClient(JSON.toJSONString(map));
```

## 杂项知识点

### Spring Task

+ Spring Task 是Spring 框架提供的任务调度工具，可以按照约定的时间自动执行某个代码逻辑

**应用场景**：

+ 信用卡每月还款提醒
+ 银行贷款每月还款提醒
+ 火车售票系统处理未支付订单
+ 入职纪念日为用户发送通知

#### cron表达式

cron表达式其实就是一个字符串，通过cron表达式可以**定义任务触发时间**

构成规则：分成6或7个域，由空格分隔开，每个域代表一个含义

每个域的含义分别为：秒、分钟、小时、日、月、周、年(可选)

#### Spring Task使用步骤：

1、导入maven坐标spring-context

2、启动类添加注释`@EnableScheduling`开启任务调度

3、自定义定时任务栏类

### WebSocket

**介绍：**WebSocket是基于TCP的一种新的**网络协议**。它实现了浏览器和服务器全双工通信——浏览器和服务器只需要完成一次握手，两者之间就可以创建持久性的连接，并进行**双向**数据传输。

#### HTTP协议和WebSocket协议对比：

+ HTTP是**短连接**
+  WebSocket是**长连接**
+ HTTP通信时**单向**的，基于请求响应模式
+ WebSocket支持**双向**通信
+ HTTP和WebSocket底层都是TCP连接

**应用场景：**

+ 视频弹幕
+ 网页聊天
+ 体育实况更新
+ 股票基金报价实时更新

```java
/**
 * WebSocket服务
 */
@Component
@ServerEndpoint("/ws/{sid}")
public class WebSocketServer {

    //存放会话对象
    private static Map<String, Session> sessionMap = new HashMap();

    /**
     * 连接建立成功调用的方法
     */
    @OnOpen
    public void onOpen(Session session, @PathParam("sid") String sid) {
        System.out.println("客户端：" + sid + "建立连接");
        sessionMap.put(sid, session);
    }
    /**
     * 收到客户端消息后调用的方法
     *
     * @param message 客户端发送过来的消息
     */
    @OnMessage
    public void onMessage(String message, @PathParam("sid") String sid) {
        System.out.println("收到来自客户端：" + sid + "的信息:" + message);
    }
    /**
     * 连接关闭调用的方法
     *
     * @param sid
     */
    @OnClose
    public void onClose(@PathParam("sid") String sid) {
        System.out.println("连接断开:" + sid);
        sessionMap.remove(sid);
    }
    /**
     * 群发
     *
     * @param message
     */
    public void sendToAllClient(String message) {
        Collection<Session> sessions = sessionMap.values();
        for (Session session : sessions) {
            try {
                //服务器向客户端发送消息
                session.getBasicRemote().sendText(message);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }
```

