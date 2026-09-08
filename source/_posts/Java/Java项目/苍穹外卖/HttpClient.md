---
title: HttpClient
date: 2026-08-06
description: HttpClient 入门笔记，介绍核心 API、发送 HTTP 请求的步骤与入门案例。
categories:
  - Java
  - Java项目
  - 苍穹外卖
---
# HttpClient

## 介绍

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

## 入门案例

对HttpClient编程工具包有了一定了解后，那么，我们使用HttpClient在Java程序当中来构造Http的请求，并且把请求发送出去，接下来，就通过入门案例分别发送**GET请求**和**POST请求**，具体来学习一下它的使用方法。

### GET方式请求

正常来说，首先，应该导入HttpClient相关的坐标，但在项目中，就算不导入，也可以使用相关的API。

因为在项目中已经引入了aliyun-sdk-oss坐标：

```XML
<dependency>
    <groupId>com.aliyun.oss</groupId>
    <artifactId>aliyun-sdk-oss</artifactId>
</dependency>
```

上述依赖的底层已经包含了HttpClient相关依赖。

![img](https://aigz8jy30yo.feishu.cn/space/api/box/stream/download/asynccode/?code=ZjE0NzMzOTZhMWJhODc2Yzg1OTdhZDg5Njk1YzBmNzBfRG16aFhvRThPMDdva2V3SVdRTGpac0o0cGQyUE84bGVfVG9rZW46Qks0NmJPTXJBb0g0QlZ4NEFsVmNNVEtubjdjXzE3ODYwMTE1OTA6MTc4NjAxNTE5MF9WNA&add_watermark=true&scene_type=CCM)

故选择导入或者不导入均可。

进入到sky-server模块，编写测试代码，发送GET请求。

**实现步骤：**

1. 创建HttpClient对象
2. 创建请求对象
3. 发送请求，接受响应结果
4. 解析结果
5. 关闭资源

```Java
package com.sky.test;

import org.apache.http.HttpEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public class HttpClientTest {

    /**
     * 测试通过httpclient发送GET方式的请求
     */
    @Test
    public void testGET() throws Exception{
        //创建httpclient对象
        CloseableHttpClient httpClient = HttpClients.createDefault();

        //创建请求对象
        HttpGet httpGet = new HttpGet("http://localhost:8080/user/shop/status");

        //发送请求，接受响应结果
        CloseableHttpResponse response = httpClient.execute(httpGet);

        //获取服务端返回的状态码
        int statusCode = response.getStatusLine().getStatusCode();
        System.out.println("服务端返回的状态码为：" + statusCode);

        HttpEntity entity = response.getEntity();
        String body = EntityUtils.toString(entity);
        System.out.println("服务端返回的数据为：" + body);

        //关闭资源
        response.close();
        httpClient.close();
    }
}
```

在访问http://localhost:8080/user/shop/status请求时，需要提前启动项目。

**测试结果：**

![img](https://aigz8jy30yo.feishu.cn/space/api/box/stream/download/asynccode/?code=NTYwMzhjOTdlNTU0MWY4NzQ4MWQ1NGIxNWNlZjFkZDZfbXhwdDVTemhQc1BxYlhGUHI2M1hhTldKbDh5WWVoWjZfVG9rZW46TFJ6NmI0cWRJb0huN2F4dlNudmNRVlpVbnBiXzE3ODYwMTE1OTA6MTc4NjAxNTE5MF9WNA&add_watermark=true&scene_type=CCM)

### POST方式请求

在HttpClientTest中添加POST方式请求方法，相比GET请求来说，POST请求若携带参数需要封装请求体对象，并将该对象设置在请求对象中。

**实现步骤：**

1. 创建HttpClient对象
2. 创建请求对象
3. 发送请求，接收响应结果
4. 解析响应结果
5. 关闭资源

```Java
  /**
     * 测试通过httpclient发送POST方式的请求
     */
    @Test
    public void testPOST() throws Exception{
        // 创建httpclient对象
        CloseableHttpClient httpClient = HttpClients.createDefault();

        //创建请求对象
        HttpPost httpPost = new HttpPost("http://localhost:8080/admin/employee/login");

        JSONObject jsonObject = new JSONObject();
        jsonObject.put("username","admin");
        jsonObject.put("password","123456");

        StringEntity entity = new StringEntity(jsonObject.toString());
        //指定请求编码方式
        entity.setContentEncoding("utf-8");
        //数据格式
        entity.setContentType("application/json");
        httpPost.setEntity(entity);

        //发送请求
        CloseableHttpResponse response = httpClient.execute(httpPost);

        //解析返回结果
        int statusCode = response.getStatusLine().getStatusCode();
        System.out.println("响应码为：" + statusCode);

        HttpEntity entity1 = response.getEntity();
        String body = EntityUtils.toString(entity1);
        System.out.println("响应数据为：" + body);

        //关闭资源
        response.close();
        httpClient.close();
    }
```

**测试结果：**

![img](https://aigz8jy30yo.feishu.cn/space/api/box/stream/download/asynccode/?code=YjNhNjk3N2ZlOTE5ZjBiYzE0M2MwMDUwODhlYTQzZDFfN1RZUjBwdldxclF4ZWdKYjkxdGk1MTR3dG5JQ0VkQnJfVG9rZW46UDFmZ2J6cDBxb3RCZFd4VWdaQWN5VDhDbkNnXzE3ODYwMTE1OTA6MTc4NjAxNTE5MF9WNA&add_watermark=true&scene_type=CCM)