---
title: Spring AI
date: 2025-12-19
categories:
  - Java
  - Java AI
tags:
  - ai/spring-ai
  - Spring AI
  - ChatClient
  - RAG
  - Agent
---
# Spring AI

## AI应用开发技术架构

| Category                                | Sub-category                                                 |
| --------------------------------------- | ------------------------------------------------------------ |
| 纯Prompt问答                            | 利用大模型的推理能力，通过 Prompt提问来完成业务              |
| Agent + Function Call                   | 大模型拆解任务，调用业务端提供的接口实现复杂业务             |
| Fine-tuning(大模型微调)                 | 针对特有业务场景对基础大模型做数据训练和微调，以满足特定场景的需求 |
| RAG (Retrieval Augmentation Generation) | 给大模型外挂一个知识库，让大模型基于知识库内容做推理和回答   |

## 聊天机器人

### ChatClient Bean 配置

这段代码通常位于配置类中，用于创建一个带有默认系统提示词的 `ChatClient` Bean。

```java
@Bean
public ChatClient chatClient(OllamaChatModel model) {
    return ChatClient.builder(model)
            .defaultSystem("你是可爱的助手，名字叫小团团")
            .build();
}
```

### 同步调用

使用 `call()` 方法进行阻塞式调用，直接获取完整的响应内容。

```java
String content = chatClient.prompt()
        .user("你是谁？")
        .call()
        .content();
```

### 流式调用

使用 `stream()` 方法进行非阻塞式调用，返回一个 `Flux` 流，适用于需要逐步显示生成内容的场景（如打字机效果）。

```java
Flux<String> content = chatClient.prompt()
        .user("你是谁？")
        .stream()
        .content();
```

### 会话日志

SpringAI利用AOP原理提供了AI会话时的拦截、增强等功能，也就是Advisor

```java
@Bean
public ChatClient chatClient(OllamaChatModel model) {
    return ChatClient.builder(model) // 创建ChatClient工厂实例
            .defaultSystem("你是可爱的小助手，名字叫小团团。")
            .defaultAdvisors(new SimpleLoggerAdvisor()) // 配置日志Advisor
            .build(); // 构建ChatClient实例
}
```

### 跨域

这张图片展示的是 Spring Boot 中解决 **跨域问题（CORS）** 的标准配置代码。

简单来说，它的作用是**打通前端与后端的通信障碍**。

以下是对这个知识点的详细讲解：

#### 什么是跨域（CORS）？

**跨域**（Cross-Origin Resource Sharing）是浏览器的一种安全机制

## 🔗 相关链接

- [[Java/Javaweb/Spring AOP|Spring AOP]] — Spring AI 中 Advisor 基于 AOP 原理
- [[Java/Javaweb/Web基础|Web 基础]] — SpringBoot IOC/DI，叫做“同源策略”。

- **同源**：指的是“协议”、“域名”、“端口”都完全相同。

- 场景

  ：

  - 前端运行在：`http://localhost:3000`
  - 后端运行在：`http://localhost:8080`
  - 虽然都是 `localhost`，但**端口号不同**（3000 vs 8080），浏览器会认为这是两个不同的“源”。

- **后果**：如果没有特殊配置，浏览器会拦截前端发给后端的请求，控制台会报红字错误（CORS error）。

#### 代码逐行解析

这段代码就是告诉浏览器：“我允许你跨域访问我的接口”。

```java
@Configuration // 1. 标记这是一个配置类，Spring 启动时会自动加载
public class MvcConfiguration implements WebMvcConfigurer { // 2. 实现 WebMvcConfigurer 接口，用来扩展 Spring MVC 的功能

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")          // 3. 允许跨域访问的路径："/**" 表示所有路径都放行
                .allowedOrigins("*")        // 4. 允许哪些域名访问："*" 表示允许所有域名（*号代表通配符）
                .allowedMethods("*")        // 5. 允许哪些请求方式：GET, POST, PUT, DELETE 等
                .allowedHeaders("*");       // 6. 允许哪些请求头：允许携带任意请求头
    }
}
```

#### 为什么要配置这个？

在现代开发中，前后端分离是主流。

- **前端**负责页面展示（Vue, React），通常跑在 Node.js 服务器上（端口 3000/8080/5173）。
- **后端**负责数据处理（Spring Boot），跑在 Tomcat/Jetty 上（端口 8080）。

因为端口不一致，天然就构成了“跨域”。如果不加这段配置，前端一调用后端接口，浏览器就会报错拦截。

#### 生产环境的隐患

虽然代码中使用了 `allowedOrigins("*")`（允许所有来源），这在开发阶段非常方便，但在**生产环境**中存在安全隐患：

- **风险**：任何恶意网站都可以请求你的后端接口，可能导致用户数据泄露。
- **建议**：在正式上线时，应该把 `"*"` 改成具体的前端域名，例如：

```java
.allowedOrigins("http://www.my-frontend.com")
```

#### 总结

这段代码就像是给后端 API 开了一个“白名单通道”，告诉浏览器：“我不介意是谁在请求我的数据，尽管放行。”

### 会话记忆功能

+ 把之前的聊天内容与新的提示词一起发给大模型

| 角色      | 描述                                                         | 示例                                                         |
| --------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| system    | 优先于user指令之前的指令，也就是给大模型设定角色和任务背景的系统指令 | 你是一个乐于助人的编程助手，你的名字叫小团团，请以小团团的风格来回答用户的问题。 |
| user      | 终端用户输入的指令（类似于你在ChatGPT聊天框输入的内容）      | 你好，你是谁？                                               |
| assistant | 由大模型生成的消息，可能是上一轮对话生成的结果               | 注意，用户可能与模型产生多轮对话，每轮对话模型都会生成不同结果。 |

#### 定义会话存储方式

```java
public interface ChatMemory {

    void add(String conversationId, List<Message> messages);

    List<Message> get(String conversationId, int lastN);

    void clear(String conversationId);
}
```

```java
@Bean
    public ChatMemory chatMemory(JdbcChatMemoryRepository chatMemoryRepository) {
        return MessageWindowChatMemory.builder()
                .chatMemoryRepository(chatMemoryRepository)
                .maxMessages(20)
                .build();
    }
```

#### 配置会话记忆Advisor

```java
@Bean
    public ChatClient chatClient(OpenAiChatModel model, ChatMemory chatMemory) {
        return ChatClient
                .builder(model)
                .defaultSystem("你是一个热心、可爱的智能助手，你叫哈基米，每个断句最后加上\"喵\"，请以哈基米的身份和语气回答问题")
                .defaultAdvisors(
                        SimpleLoggerAdvisor.builder().build(), //日志记录advisor
                        MessageChatMemoryAdvisor.builder(chatMemory).build() //聊天记忆advisor
                )
                .build();
    }
```

#### 添加会话id

```java
@PostMapping(value = "/chat", produces = "text/html;charset=utf-8")
    public Flux<String> chat(String prompt,@RequestParam("chatId") String chatId) {
        return chatClient.prompt()
                .user(prompt)
                .advisors(as -> as.param(ChatMemory.CONVERSATION_ID,chatId)) // 设置会话ID
                .stream()
                .content();
    }
```

### 会话历史
