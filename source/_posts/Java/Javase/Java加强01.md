---
title: Java加强01
date: 2025-12-19
description: Java 加强课程第一部分，涵盖异常处理、泛型、包装类等进阶知识点。
categories:
  - Java
  - Javase
tags:
  - java/advanced
  - 异常
  - 泛型
  - 包装类
---
# Java加强01

## 异常

### 认识异常

+ 异常代表程序出现的问题
+ Exception：叫异常，程序可能出现问题
  - 运行时异常：RuntimeException及其子类，编译阶段不会出现错误体现，运行时出现的异常（如：数组索引越界异常）
  - 编译时异常：编译阶段就会出现错误提醒的（如：日期解析异常）

### 异常的基本处理

+ **抛出异常(throws)**       alt+回车

  - 在方法上使用throws关键字，可以将方法内部出现的异常抛出去给调用者处理

  ```java
  方法 throws 异常1,异常2,异常3..{
  }
  ```

+ **捕获异常(try...catch)**

  - 直接捕获程序出现的异常

  ```java
  try{
      //监视可能出现异常的代码！出现异常，会被catch拦截住这个异常
  }catch(异常类型1 变量){
      //处理异常
  }catch(异常类型2 变量){
      //处理异常
  }...
  ```

### 异常的作用？

+ 作用1：异常是用来定位bug的关键信息

+ 作用2：可以作为方法内部的一种特殊返回值以便通知上层调用者，方法的执行问题

  ```java
  throw new exception("除数不能为0");
  ```

### 自定义异常

+ Java无法为所有问题提供异常类，企业某种问题想通过异常来表示，以便用异常来管理该问题，那就需要自己来定义异常类了。

+ **自定义编译时异常**

  - 定义一个异常类继承Exception
  - 重写构造器
  - 通过throw new异常类(xxx)创建异常对象并抛出

  特点：编译阶段就报错，提醒比较激进

## 异常的处理方案

+ 方法一：底层异常层层往上抛出，最外层捕获异常，记录下异常信息，并响应适合用户观看的信息进行提示
+ 方法二：最外层捕获异常后，尝试重新修复  （ctrl+alt+t）//用的多

---

## 泛型

### 认识泛型

+ 定义类、接口、方法时，同时声明了一个或者多个类型变量（如：<E>）

+ 称为泛型类、泛型接口、泛型方法，它们统称为泛型。

  ```java
  //例如：
  public class ArrayList<E>{
      ...
  }
  ```

+ **作用**：泛型提供了在编译阶段约束所能操作的数据类型，并自动进行检查的能力。

  可以避免强制类型转换，及其可能出现的异常。

+ **泛型的本质**：把基本的数据类型作为参数传给类型变量。

### 泛型类

```java
修饰符 class 类名<类型变量，类型变量，...>{   
}
//例如:
public class ArrayList<E>{
}
```

+ **注意**：类型变量建议用**大写**英文字母，常用的有：**E **(Element元素类型)、**T** (Type返回值类型)、**K** (Key键类型)、**V** (Value值类型)等等。

#### 自定义泛型类

+ 例如：模拟ArrayList集合自定义一个集合MyArrayList。

  ```java
  //泛型类
  public class MyArrayList<E>{
      private ArrayList list= new ArrayList();
      
      public boolean add(E e){
          list.add(e);
          return true; //添加成功
      }
      
      public boolen remove(E e){
          return list.remove(e); //成功删除
      }
  }
  ```

  ```java
  MyArrayList<String> list= new MyArrayList<>()
  list.add("Hello");
  //JDK7开始支持后面的类型可以不写
  ```

### 泛型接口

```java
修饰符 interface 接口名<类型变量，类型变量，...>{
}
//例如：
public interface A<E>{
}
```

+ **注意**：类型变量建议用**大写**英文字母，常用的有：**E **(Element元素类型)、**T** (Type返回值类型)、**K** (Key键类型)、**V** (Value值类型)等等。

#### 自定义泛型接口

+ 需求：项目需要对学生/老师数据进行增删改查操作

  ```java
  public interface Data<T>{
      void add(T t);
      void delete(T t);
      void change(T t);
      T search(int id);
  }
  ```

  ```java
  public class StudentData implements Data<Student>{
      @Override
      public void add(Student student) {
      }
      @Override
      public void remove(Student student) {
      }
      @Override
      public void update(Student student) {
      }
      @Override
      public Student find(int id){
          return new Student();
      }
  }
  ```
  

### 泛型方法

```java
修饰符 <类型变量，类型变量...> 返回值类型 方法名(形参列表){
}
```

#### 自定义泛型方法

+ 需求：打印任意数组的内容。

  ```java
  public class Test {
      public static void main(String[] args) {
          String[] names={"张三","李四","王五"};
          printName(names);
          System.out.println(getMax(names));
      }
      public static <T> void printName(T[] names){
          for(T name:names){
              System.out.println(name);
          }
      }
      public static <T> T getMax(T[] names){
          return names[0];
      }
  }
  ```

### 通配符

+ 就是"?"，可以在“<mark>使用</mark>泛型”的时候代表一切类型；(E T K V 是在<mark>定义</mark>泛型的时候使用)

### 泛型的上下限

+ **泛型上限** `? extends T`：能处理 **T 类型或 T 的子类型**

  - **用途：** 用来**读取**数据。你从里面取出来的对象，至少是 `T` 类型，可以放心使用 `T` 的方法。
  - **限制：** 不能往里面**添加**数据（除了 `null`），因为你不知道它具体是 `T` 还是 `T` 的哪个子类型，加进去可能会出错。

  ```java
  public static void walk(ArrayList<? extends People>peoples){
  }
  ```

  - ?  能接收的必须是T或者其子类。

+ **泛型下限** `? super T`：能接收 **T 类型或 T 的父类型**。

  - **用途：** 用来**写入**数据。任何 `T` 类型或 `T` 的子类型，都可以安全地放进 `T` 的父类型容器里。
  - **限制：** 不能安全地**读取**数据（不能保证读出来的是什么具体类型），但可以读出来作为 `Object`。

  - ? 能接受的必须是T或者其父类。

### 泛型支持的类型

+ 泛型不支持基本类型，只能支持对类型（引用数据类型）。

### 包装类

+ 包装类就是把基本类型的数据包装成对象的类型。

  |  基本数据类型  | 对于的包装类（引用数据类型） |
  | :------------: | :--------------------------: |
  | 一般的数据类型 |          首字母大写          |
  |      int       |           Integer            |
  |      char      |          Character           |

  | 基本类型的数据包装成对象的方案(繁琐)  |
  | :-----------------------------------: |
  | public static Interger valueOf(int i) |
  |  Integer it = Integer.valueOf(100);   |

  #### 自动装箱：

  + 基本数据类型可以自动转换为包装类型。

  ```java
  Integer it1 = 100;
  ```

  ```java
  List<Integer> list = new ArrayList<>();
  int i = 10;
  list.add(Integer.valueOf(i));
  list.add(i); // 自动装箱
  ```

  #### 自动拆箱：

  - 包装类型可以自动转换为基本数据类型。

  ```java
  Integer obj = new Integer(10);
  int j = obj; // 自动拆箱：int j = obj.intValue();
  ```

#### 包装类具备的其他功能

+ 可以把基本类型的数据转换为字符串类型。

  ```java
  public static String toString(double d)
  public String toString()
  ```

  ```java'
  int i=1;
  String rs1=Integer.toString(i);
  ```

+ 可以把字符串类型的数值转换成数值本身对应的真实数据类型。

  ```java
  public static int parseInt(String s)
  public static Integer valueOf(String s)
  ```
