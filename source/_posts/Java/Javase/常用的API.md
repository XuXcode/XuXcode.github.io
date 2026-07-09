---
title: 常用的API
date: 2025-12-19
categories:
  - Java
  - Javase
tags:
  - java/api
  - Math
  - System
  - Object
  - Date
  - BigDecimal
---
# 常用的API

## 1、Math类

+ Math类包含执行基本数字运算的方法，我们可以使用Math类完成基本的数学运算

### 常见方法

| 代码片段                                       | 功能描述                              |
| ---------------------------------------------- | ------------------------------------- |
| `public static int abs(int a)`                 | 获取参数的绝对值                      |
| `public static double ceil(double a)`          | 获取大于或等于参数的最小整数          |
| `public static double floor(double a)`         | 获取小于或等于参数的最大整数          |
| `public static int round(float a)`             | 按照四舍五入返回最接近参数的int类型值 |
| `public static int max(int a, int b)`          | 获取两个int值中的较大值               |
| `public static int min(int a, int b)`          | 获取两个int值中的较小值               |
| `public static double pow(double a, double b)` | 计算a的b次幂的值                      |
| `public static double random()`                | 获取一个[0.0,1.0)范围内的随机值       |

---

## 2、System类

+ System包含了系统操作的一些常用的方法。

### 常见方法

| 代码片段                                                     | 功能描述                                                     |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| `public static long currentTimeMillis()`                     | 获取当前时间所对应的毫秒值（当前时间为0时区所对应的时间，即英国格林尼治天文台旧址所在位置） |
| `public static void exit(int status)`                        | 终止当前正在运行的Java虚拟机，0表示正常退出，非零表示异常退出 |
| `public static native void arraycopy(Object src, int srcPos, Object dest, int destPos, int length)` | 进行数组元素的复制                                           |

## 3、Runtime

+ Runtime表示Java中运行时对象，可以获取到程序运行时设计到的一些信息

### 常见方法

| 代码片段                              | 功能描述                                  |
| ------------------------------------- | ----------------------------------------- |
| `public static Runtime getRuntime()`  | 获取当前系统的运行环境对象                |
| `public void exit(int status)`        | 停止虚拟机                                |
| `public int availableProcessors()`    | 获得CPU的线程数                           |
| `public long maxMemory()`             | JVM能从系统中获取总内存大小（单位byte）   |
| `public long totalMemory()`           | JVM已经从系统中获取总内存大小（单位byte） |
| `public long freeMemory()`            | JVM剩余内存大小（单位byte）               |
| `public Process exec(String command)` | 运行cmd命令                               |

---

## 4、Object类

+ Object类所在包是java.lang包。Object 是类层次结构的根，每个类都可以将 Object 作为超类。所有类都直接或者间接的继承自该类；换句话说，该类所具备的方法，其他所有类都继承了。

### 常用方法

| 代码片段                            | 功能描述                                                     |
| ----------------------------------- | ------------------------------------------------------------ |
| `public String toString()`          | 返回该对象的字符串表示形式（可以看做是对象的内存地址值）     |
| `public boolean equals(Object obj)` | 比较两个对象地址值是否相等；`true`表示相同，`false`表示不相同 |
| `protected Object clone()`          | 对象克隆                                                     |
| `public long getId()`               | 获取线程的唯一标识符ID                                       |

---

## 5、Objects类

+ Objects类所在包是在java.util包下，因此在使用的时候需要进行导包。并且Objects类是被final修饰的，因此该类不能被继承。

### 重点学习的方法

| 代码片段                                           | 功能描述                 |
| -------------------------------------------------- | ------------------------ |
| `public static String toString(Object o)`          | 获取对象的字符串表现形式 |
| `public static boolean equals(Object a, Object b)` | 比较两个对象是否相等     |
| `public static boolean isNull(Object obj)`         | 判断对象是否为 null      |
| `public static boolean nonNull(Object obj)`        | 判断对象是否不为 null    |

### 需要了解的方法

| 代码片段                                                     | 功能描述                                                     |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| `public static <T> T requireNonNull(T obj)`                  | 检查对象是否不为 null，如果为 null 直接抛出异常；如果不是 null 返回该对象 |
| `public static <T> T requireNonNullElse(T obj, T defaultObj)` | 检查对象是否不为 null，如果不为 null，返回该对象；如果为 null，返回 defaultObj 值 |
| `public static <T> T requireNonNullElseGet(T obj, Supplier<? extends T> supplier)` | 检查对象是否不为 null，如果不为 null，返回该对象；如果为 null，返回由 Supplier 所提供的值 |

---

## 6、**BigInteger类**

+ 平时在存储整数的时候，Java中默认是int类型，int类型有取值范围：-2147483648 ~ 2147483647。如果数字过大，我们可以使用long类型，但是如果long类型也表示不下怎么办呢？
+ 就需要用到BigInteger，可以理解为：大的整数。有多大呢？理论上最大到42亿的21亿次方，基本上在内存撑爆之前，都无法达到这个上限。

### 常见方法

#### 常见构造方法

| 代码片段                                     | 功能描述                                 |
| -------------------------------------------- | ---------------------------------------- |
| `public BigInteger(int num, Random rnd)`     | 获取随机大整数，范围：[0 ~ 2的num次方-1] |
| `public BigInteger(String val)`              | 获取指定的大整数                         |
| `public BigInteger(String val, int radix)`   | 获取指定进制的大整数                     |
| `public static BigInteger valueOf(long val)` | 静态方法获取BigInteger的对象，内部有优化 |

> 构造方法小结：
>
> + 如果BigInteger表示的数字没有超出long的范围，可以用静态方法获取。
> + 如果BigInteger表示的超出long的范围，可以用构造方法获取。
> + 对象一旦创建，BigInteger内部记录的值不能发生改变。
> + 只要进行计算都会产生一个新的BigInteger对象

#### 常见成员方法

| 代码片段                                                 | 功能描述                          |
| -------------------------------------------------------- | --------------------------------- |
| `public BigInteger add(BigInteger val)`                  | 加法                              |
| `public BigInteger subtract(BigInteger val)`             | 减法                              |
| `public BigInteger multiply(BigInteger val)`             | 乘法                              |
| `public BigInteger divide(BigInteger val)`               | 除法                              |
| `public BigInteger[] divideAndRemainder(BigInteger val)` | 除法，获取商和余数                |
| `public boolean equals(Object x)`                        | 比较是否相同                      |
| `public BigInteger pow(int exponent)`                    | 次幂、次方                        |
| `public BigInteger max/min(BigInteger val)`              | 返回较大值/较小值                 |
| `public int intValue(BigInteger val)`                    | 转为int类型整数，超出范围数据有误 |

## 7、**BigDecimal类**

+ BigDecimal所在包是在java.math包下，因此在使用的时候就需要进行导包。我们可以使用BigDecimal类进行更加精准的数据计算。

### 常用方法

#### 常用成员方法

| 代码片段                                       | 功能描述 |
| ---------------------------------------------- | -------- |
| `public BigDecimal add(BigDecimal value)`      | 加法运算 |
| `public BigDecimal subtract(BigDecimal value)` | 减法运算 |
| `public BigDecimal multiply(BigDecimal value)` | 乘法运算 |
| `public BigDecimal divide(BigDecimal value)`   | 除法运算 |

## 8、Date类

+ java.util.Date类 表示特定的瞬间，精确到毫秒。

### 构造方法

| 构造方法               | 说明                                                         |
| ---------------------- | ------------------------------------------------------------ |
| public Date()          | 从运行程序的此时此刻到时间原点经历的毫秒值,转换成Date对象，分配Date对象并初始化此对象，以表示分配它的时间（精确到毫秒） |
| public Date(long date) | 将指定参数的毫秒值date,转换成Date对象，分配Date对象并初始化此对象，以表示自从标准基准时间（称为“历元（epoch）”，即1970年1月1日00:00:00 GMT）以来的指定毫秒数 |

### 常用方法

| 方法                           | 说明                                 |
| ------------------------------ | ------------------------------------ |
| public long getTime()          | 把日期对象转换成对应的时间毫秒值     |
| public void setTime(long time) | 把方法参数给定的毫秒值设置给日期对象 |

---

## 9、**SimpleDateFormat类**

+ `java.text.SimpleDateFormat` 是日期/时间格式化类，我们通过这个类可以帮我们完成日期和文本之间的转换,也就是可以在Date对象与String对象之间进行来回转换。

### 构造方法

| 构造方法                                | 说明                                                         |
| --------------------------------------- | ------------------------------------------------------------ |
| public SimpleDateFormat(String pattern) | 用给定的模式和默认语言环境的日期格式符号构造SimpleDateFormat。参数pattern是一个字符串，代表日期时间的自定义格式 |

### 格式规则

| 标识字母（区分大小写） | 含义 |
| ---------------------- | ---- |
| y                      | 年   |
| M                      | 月   |
| d                      | 日   |
| H                      | 时   |
| m                      | 分   |
| s                      | 秒   |

### 常用方法

| 方法                             | 说明                     |
| -------------------------------- | ------------------------ |
| public String format(Date date)  | 将Date对象格式化为字符串 |
| public Date parse(String source) | 将字符串解析为Date对象   |

## 10、**Calendar类**

+ java.util.Calendar类表示一个“日历类”，可以进行日期运算。它是一个抽象类，不能创建对象，我们可以使用它的子类：java.util.GregorianCalendar类

+ 有两种方式可以获取GregorianCalendar对象：
  - 直接创建GregorianCalendar对象;
  - 通过Calendar的静态方法getInstance()方法获取GregorianCalendar对象

| 方法名                                | 说明                                                         |
| ------------------------------------- | ------------------------------------------------------------ |
| public static Calendar getInstance()  | 获取一个它的子类GregorianCalendar对象。                      |
| public int get(int field)             | 获取某个字段的值。field参数表示获取哪个字段的值， 可以使用Calender中定义的常量来表示： Calendar.YEAR : 年 Calendar.MONTH ：月 Calendar.DAY_OF_MONTH：月中的日期 Calendar.HOUR：小时 Calendar.MINUTE：分钟 Calendar.SECOND：秒 Calendar.DAY_OF_WEEK：星期 |
| public void set(int field,int value)  | 设置某个字段的值                                             |
| public void add(int field,int amount) | 为某个字段增加/减少指定的值                                  |
