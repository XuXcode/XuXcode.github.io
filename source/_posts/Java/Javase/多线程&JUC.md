---
title: 多线程&JUC
date: 2025-12-19
description: 本文讲解 Java 多线程与 JUC 并发工具，包括线程池、锁机制与并发集合。
categories:
  - Java
  - Javase
tags:
  - java/concurrency
  - java/advanced
  - 多线程
  - JUC
  - 线程池
  - 并发
---
# 多线程&JUC

## 认识多线程

从软件或者硬件上实现多个线程并发执行的技术。具有多线程能力的计算机因有硬件支持而能够在同一时间执行多个线程，提升性能

## 并发和并行

+ 并行：在同一时刻，有多个指令在多个CPU上同时执行
+ 并发：在同一时刻，有多个指令在单个CPU上交替执行

## 进程和线程

+ 进程：是正在运行的程序
+ 线程：是进程中的单个顺序控制流，是一条执行路径

## 实现多线程

### 方式一：继承Thread类的方式进行实现

`java.lang.Thread` 是 Java 语言中实现多线程编程的核心类。它代表了一个正在执行的线程

| 方法         | 说明                                      |
| ------------ | ----------------------------------------- |
| void run()   | 在线程开启后，此方法将被调用执行          |
| void start() | 使此线程开始执行，Java虚拟机会调用run方法 |

步骤：将类声明为Thread的子类，重写run方法，创建子类的对象，并启动线程。

### 方式二：实现Runnable接口的方式进行实现

步骤：自己定义一个类实现Runnable接口，重写里面的run方法，创建自己定义的类的对象，最后创建一个Thread类的对象，并开启线程

| 方法名                              | 说明                   |
| ----------------------------------- | ---------------------- |
| Thread(Runnable target)             | 分配一个新的Thread对象 |
| Thread(Runnable target,String name) | 分配一个新的Thread对象 |

### 方式三：利用Callable接口和Future接口方式实现

+ 特点：可以获取到多线程运行的结果
+ 步骤：
  - 1、创建一个类MyCallable实现Callable接口
  - 2、重写call(有返回值的，表示多线程运行的结果)
  - 3、创建MyCallable的对象(表示多线程要执行的任务)
  - 4、创建FutureTask对象(作用管理多线程运行的结果)
  - 5、创建Thread类对象，并启动(表示线程)

| 方法名                             | 说明                                               |
| ---------------------------------- | -------------------------------------------------- |
| `V call()`                         | 计算结果，如果无法计算结果，则抛出一个异常         |
| `FutureTask(Callable<V> callable)` | 创建一个 FutureTask，一旦运行就执行给定的 Callable |
| `V get()`                          | 如有必要，等待计算完成，然后获取其结果             |

```java
// 创建MyCallable的对象（表示多线程要执行的任务）
MyCallable mc = new MyCallable();
// 创建FutureTask的对象（作用管理多线程运行的结果）
FutureTask<Integer> ft = new FutureTask<>(mc);
// 创建线程的对象
Thread t1 = new Thread(ft);
// 启动线程
t1.start();
// 获取多线程运行的结果
Integer result = ft.get();
System.out.println(result);
```

### 多线程三种实现方式对比

| 方式               | 优点                                           | 缺点                                         |
| ------------------ | ---------------------------------------------- | -------------------------------------------- |
| 继承 Thread 类     | 编程比较简单，可以直接使用 Thread 类中的方法   | 可以扩展性较差，不能再继承其他的类           |
| 实现 Runnable 接口 | 扩展性强，实现该接口的同时还可以继承其他的类   | 编程相对复杂，不能直接使用 Thread 类中的方法 |
| 实现 Callable 接口 | 支持返回值和抛出异常，可以配合 Future 获取结果 | 需要结合 FutureTask 或线程池使用，相对复杂   |

### Thread类常用的成员方法

| 方法名称                           | 说明                                     |
| ---------------------------------- | ---------------------------------------- |
| `String getName()`                 | 返回此线程的名称                         |
| `void setName(String name)`        | 设置线程的名字（构造方法也可以设置名字） |
| `static Thread currentThread()`    | 获取当前线程的对象                       |
| `static void sleep(long time)`     | 让线程休眠指定的时间，单位为毫秒         |
| `setPriority(int newPriority)`     | 设置线程的优先级                         |
| `final int getPriority()`          | 获取线程的优先级                         |
| `final void setDaemon(boolean on)` | 设置为守护线程                           |
| `public static void yield()`       | 出让线程/礼让线程                        |
| `public static void join()`        | 插入线程/插队线程                        |

## 线程同步

### 安全问题

+ 线程执行时，有随机性。

### 同步代码块

+ 把操作共享数据的代码锁起来
+ 格式：

```java
synchronized(锁对象（唯一，用static修饰/类名.class）){
    操作共享数据的代码
}
```

+ 特点：
  - 1、锁默认打开，有一个线程进去了，锁自动关闭
  - 2、里面的代码全部执行完毕，线程出来，锁自动打开        

### 同步方法

+ 就是把synchronized关键字加到方法上
+ 格式

```java
修饰符 synchronized 返回值类型 方法名(方法参数){...}
```

特点：

- 1、同步方法是锁住方法里面所有的代码
- 2、锁对象不能自己指定
  - 非静态：this
  - 静态：当前类的字节码文件对象

### Lock锁【应用】

虽然我们可以理解同步代码块和同步方法的锁对象问题，但是我们并没有直接看到在哪里加上了锁，在哪里释放了锁，为了更清晰的表达如何加锁和释放锁，JDK5以后提供了一个新的锁对象Lock。

Lock是接口不能直接实例化，这里采用它的实现类ReentrantLock来实例化

+ ReentrantLock构造方法

| 方法名          | 说明                        |
| --------------- | --------------------------- |
| ReentrantLock() | 创建一个ReentrantLock的实例 |

+ 加锁解锁方法

| 方法名        | 说明   |
| ------------- | ------ |
| void lock()   | 获得锁 |
| void unlock() | 释放锁 |

+ 示例代码：买票

```java
public class Ticket implements Runnable {
    //票的数量
    private int ticket = 100;
    private Object obj = new Object();
    private ReentrantLock lock = new ReentrantLock();

    @Override
    public void run() {
        while (true) {
            //synchronized (obj){//多个线程必须使用同一把锁.
            try {
                lock.lock();
                if (ticket <= 0) {
                    //卖完了
                    break;
                } else {
                    Thread.sleep(100);
                    ticket--;
                    System.out.println(Thread.currentThread().getName() + "在卖票,还剩下" + ticket + "张票");
                }
            } catch (InterruptedException e) {
                e.printStackTrace();
            } finally {
                lock.unlock();
            }
            // }
        }
    }
}
```

### 死锁【理解】

线程死锁是指由于两个或者多个线程互相持有对方所需要的资源，导致这些线程处于等待状态，无法前往执行

产生条件：

+ 资源有限
+ 同步嵌套

不要将两个锁进行嵌套

## 生产者消费者(等待唤醒机制)

生产着消费者模式是一个十分经典的多线程协作的模式

+ 生产者线程用于生产数据
+ 消费者线程用于消费数据

Object类的等待和唤醒方法：

| 方法名            | 说明                                                         |
| ----------------- | ------------------------------------------------------------ |
| void wait()       | 导致当前线程等待，直到另一个线程调用该对象的notify()方法或notifyAll()方法 |
| void notify()     | 唤醒正在等待对象监听器的单个线程，若等待线程多则随机唤醒     |
| void  notifyAll() | 唤醒正在等待对象监听器的所有线程                             |

## 阻塞队列方式实现(等待唤醒机制)

+ 生产者和消费者必须使用同一阻塞队列
+ 阻塞队列底层代码自带锁

```Java
public class Demo02 {
    public static void main(String[] args) throws Exception {
        // 创建阻塞队列的对象,容量为 1
        ArrayBlockingQueue<String> arrayBlockingQueue = new ArrayBlockingQueue<>(1);
        // 存储元素
        arrayBlockingQueue.put("汉堡包");
        // 取元素
        System.out.println(arrayBlockingQueue.take());
        System.out.println(arrayBlockingQueue.take()); // 取不到会阻塞
        System.out.println("程序结束了");
    }
}
```

```Java
public class Cooker extends Thread {
    private ArrayBlockingQueue<String> bd;
    public Cooker(ArrayBlockingQueue<String> bd) {
        this.bd = bd;
    }
//    生产者步骤：
//            1，判断桌子上是否有汉堡包
//    如果有就等待，如果没有才生产。
//            2，把汉堡包放在桌子上。
//            3，叫醒等待的消费者开吃。
    @Override
    public void run() {
        while (true) {
            try {
                bd.put("汉堡包");
                System.out.println("厨师放入一个汉堡包");
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }
}
public class Foodie extends Thread {
    private ArrayBlockingQueue<String> bd;
    public Foodie(ArrayBlockingQueue<String> bd) {
        this.bd = bd;
    }
    @Override
    public void run() {
//        1，判断桌子上是否有汉堡包。
//        2，如果没有就等待。
//        3，如果有就开吃
//        4，吃完之后，桌子上的汉堡包就没有了
//                叫醒等待的生产者继续生产
//        汉堡包的总数量减一
        //套路:
        //1. while(true)死循环
        //2. synchronized 锁,锁对象要唯一
        //3. 判断,共享数据是否结束. 结束
        //4. 判断,共享数据是否结束. 没有结束
        while (true) {
            try {
                String take = bd.take();
                System.out.println("吃货将" + take + "拿出来吃了");
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }
}
public class Demo {
    public static void main(String[] args) {
        ArrayBlockingQueue<String> bd = new ArrayBlockingQueue<>(1);
        Foodie f = new Foodie(bd);
        Cooker c = new Cooker(bd);
        f.start();
        c.start();
    }
}
```

## 线程的六种状态

+ 新建状态(NEW)-->创建线程对象
+ 就绪状态(RUNNABLE)-->start方法
+ 阻塞状态(BLOCKED)-->无法获得锁对象
+ 等待状态(WAITING)-->wait方法
+ 计时等待(TIMED_WAITING)-->sleep方法
+ 结束状态(TERMINATED)-->全部代码运行完毕

## 线程池

线程池在启动的时，会创建大量空闲线程，当我们向线程池提交任务的时，线程池就会启动一个线程来执行该任务。等待任务执行完毕以后，线程并不会死亡，而是再次返回到线程池中称为空闲状态。等待下一次任务的执行

### 线程池的主要核心原理

+ 1、创建一个池子，池子中是空的
+ 2、提交任务时，池子会创建新的线程对象，任务执行完毕，线程归还给池子，下回提交任务时，不需要创建新的线程，直接复用已有的线程即可
+ 3、但是如果提交任务时，池子中没有空闲线程，也无法创建新的线程，任务就会排队等待

### 线程池代码实现

+ 1、创建线程池
+ 2、提交任务
+ 3、所有任务全部执行完毕，关闭线程池

**Executors**：线程池的工具类通过调用方法返回不同类型的线程池对象

| 构造方法                                                     | 说明                     |
| ------------------------------------------------------------ | ------------------------ |
| `public static ExecutorService newCachedThreadPool()`        | 创建一个没有上限的线程池 |
| `public static ExecutorService newFixedThreadPool(int nThreads)` | 创建有上限的线程池       |

| 方法名称                             | 说明                                                         |
| ------------------------------------ | ------------------------------------------------------------ |
| `Future<?> submit(Runnable task)`    | 提交一个 Runnable 任务用于执行，并返回一个 Future 代表任务的完成状态。 |
| `Future<T> submit(Callable<T> task)` | 提交一个 Callable 任务用于执行，并返回一个 Future 代表任务的执行结果。 |
| `void execute(Runnable command)`     | 执行 Runnable 任务，无返回值。如果无法执行该任务（例如因为线程池已关闭），则会抛出 RejectedExecutionException。 |
| `List<Runnable> shutdownNow()`       | 尝试停止所有正在执行的任务，暂停处理正在等待的任务，并返回一个列表，其中包含尚未执行的任务。 |
| `void shutdown()`                    | 平滑地关闭线程池。不再接受新的任务，但会执行完所有已提交的任务（包括正在执行的和队列中的）。 |
| `boolean isShutdown()`               | 如果此执行程序已被关闭，则返回 `true`。                      |
| `boolean isTerminated()`             | 如果此执行程序已关闭，并且所有任务都已完成执行，则返回 `true`。 |

### 自定义线程池

```Java
public ThreadPoolExecutor(int corePoolSize,
                          int maximumPoolSize,
                          long keepAliveTime,
                          TimeUnit unit,
                          BlockingQueue<Runnable> workQueue,
                          ThreadFactory threadFactory,
                          RejectedExecutionHandler handler)
    
corePoolSize：   核心线程的最大值，不能小于0
maximumPoolSize：最大线程数，不能小于等于0，maximumPoolSize >= corePoolSize
keepAliveTime：  空闲线程最大存活时间,不能小于0
unit：           时间单位 用TimeUnit去指定
workQueue：      任务队列，不能为null
threadFactory：  创建线程工厂,不能为null      
handler：        任务的拒绝策略,不能为null  
```

#### 任务拒绝策略

| 任务拒绝策略                             | 说明                                                         |
| ---------------------------------------- | ------------------------------------------------------------ |
| `ThreadPoolExecutor.AbortPolicy`         | 默认策略：丢弃任务并抛出 `RejectedExecutionException` 异常   |
| `ThreadPoolExecutor.DiscardPolicy`       | 丢弃任务，但是不抛出异常。这是不推荐的做法                   |
| `ThreadPoolExecutor.DiscardOldestPolicy` | 抛弃队列中等待最久的任务，然后把当前任务加入队列中           |
| `ThreadPoolExecutor.CallerRunsPolicy`    | 调用任务的 `run()` 方法绕过线程池直接执行（由调用者线程执行） |

### 线程池多大合适？

| 运算类型       | 线程池大小计算公式                                           | 说明                                                         |
| -------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| CPU 密集型运算 | `最大并行数 + 1`                                             | 最大并行数通常等于 CPU 核心数。该公式用于最大化 CPU 利用率，避免过多线程导致上下文切换开销。 |
| I/O 密集型运算 | `最大并行数 * 期望 CPU 利用率 * (总时间 / CPU 计算时间)` 即：`最大并行数 × 期望 CPU 利用率 × (CPU计算时间 + 等待时间) / CPU计算时间` | I/O 密集型任务大部分时间在等待（如磁盘读写、网络通信），因此可以设置更多线程以提高吞吐量。 |

## 🔗 相关链接

- [[Java/Javaweb/Spring AOP|Spring AOP]] — ThreadLocal 线程隔离
- [[Java/Javase/存储&读写数据的方案|存储 & 读写数据]] — I/O 密集型场景
