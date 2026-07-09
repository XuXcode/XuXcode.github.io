---
title: Java加强02——集合框架
date: 2025-12-19
categories:
  - Java
  - Javase
tags:
  - java/collection
  - java/api
  - Collection
  - List
  - Set
  - Map
  - Stream
---
#  Java加强02——集合框架

## 认识集合

+ 集合是一种容器，用来装数据的，类似于数组，但集合的大小可变，开发中常用
+ Collection代表单列集合，每个元素（数据）只包含一个值。
+ Map代表双列集合，每个元素包含两个值（键值对）。

## 集合体系结构

### Collection集合特点

+ **List系列集合**：添加的元素是有序的、可重复、有索引。
  - ArrayList、LinkedList：有序的、可重复、有索引
+ **Set系列集合**：添加的元素是无序、不重复、无索引。
  - HashSet：无序、不重复、无索引
  - LinkedHashSet：有序、不重复、无索引
  - TreeSet：按照大小默认升序排序、不重复、无索引

## Collection集合

### 常用功能

> Collection是单列集合的祖宗，它规定的方法(功能)是全部单列集合会继承的，所以先学Collection的常用方法。

|               方法名                |               说明               |
| :---------------------------------: | :------------------------------: |
|       public boolean add(E e)       |   把给定的对象添加到当前集合中   |
|         public void clear()         |       清空集合中的所有元素       |
|     public boolean remove(E e)      |   把给定的对象在当前集合中删除   |
| public boolean contains(Object obj) | 判断当前集合中是否包含给定的对象 |
|      public boolean isEmpty()       |       判断当前集合是否为空       |
|          public int size()          |       返回集合中元素的个数       |
|      public Object[] toArray()      |    把集合中的元素存储到数组中    |

### 遍历方法

#### 方法一：迭代器遍历

+ 迭代器是用来遍历集合的专用方式(数组没有迭代器)，Java中迭代器的的代表是**Iterator**。

###### Collection集合获取迭代器的方法

|        方法名称         |                             说明                             |
| :---------------------: | :----------------------------------------------------------: |
| Iterator<E>  iterator() | 返回集合中的迭代器对象，该迭代器对象默认指向当前集合的第一个元素 |

###### Iterator迭代器中的常用方法

|      方法名称      |                          说明                          |
| :----------------: | :----------------------------------------------------: |
| boolean hasNext( ) |        询问当前位置是否有元素存在，存在返回true        |
|     E next( )      | 获取当前位置的元素，并同时将迭代器对象指向下一个元素处 |

```java
Collection<String> names=new ArrayList<>();
//1、得到这个集合的迭代器对象
Iterator<String> it=names.iterator();
//2、使用一个while循环来遍历
while(it.hasNext()){
    String name=it.next();
    System.out.println(name);
}
```

#### 方法二：增强for循环

+ 记住格式：

  ```java
  for(元素的数据类型 变量名:数组或者集合){
      
  }
  ```

+ 增强for可以用来遍历集合或者数组。

+ 增强for遍历集合，本质就是迭代器遍历集合的简化写法

+ 缺点：只能访问里面的元素，不能对其中的元素进行修改

```java
Collection<String> c=new ArrayList<>();
...
for(String s:c){
    System.out.println(s);
}
```

#### 方法三：Lambda表达式

+ 得益于JDK8开始的新技术Lambda表达式，提供了一种更简单、更直接的方式来遍历集合。

需要使用Collection的如下方法来完成：

|                     方法名称                     |        说明        |
| :----------------------------------------------: | :----------------: |
| default void forEach(Consumer<? super T> action) | 结合lambda遍历集合 |

### 并发修改异常问题

#### 认识问题

+ 遍历集合的同时又存在增删集合元素的行为时，可能出现业务异常，这种现象被称之为并发修改异常问题。

#### 解决问题

+ 1、如果集合支持索引，可以使用for循环遍历，每删除数据后做`i--;`或者可以倒着遍历
+ 2、可以使用迭代器遍历，并用迭代器提供的方法删除数据
+ 注意：增强for循环/Lambda遍历均不能解决并发修改异常问题，因此它们只适合做数据的遍历，不适合同时做增删操作。

## List集合

### List集合的特有方法

+ List集合因为支持索引，所以多了很多与索引相关的方法，当然，Collection的功能List也继承了

|           方法名称            |                  说明                  |
| :---------------------------: | :------------------------------------: |
| void add(int index,E element) |    在此集合中的指定位置插入指定元素    |
|      E remove(int index)      | 删除指定索引处的元素，返回被删除的元素 |
|  E set(int index,E element)   | 修改指定索引处的元素，返回被修改的元素 |
|       E get(int index)        |          返回指定索引处的元素          |

### List集合支持的遍历方式

+ 1、for循环(因为List集合有索引)
+ 2、迭代器
+ 3、增强for循环
+ 4、Lambda表达式

### ArrayList的底层原理

+ ArrayList底层是基于<font color=red>数组</font>存储数据的

+ LinkedList底层是基于<font color=red>双链表</font>存储数据的（先增后删）

  - LinkedList新增了很多首尾操作的特有方法

  |         方法名称          |               说明               |
  | :-----------------------: | :------------------------------: |
  | public void addFirst(E e) |    在该列表开头插入指定的元素    |
  | public void addLast(E e)  |  将指定的元素追加到此列表的末尾  |
  |    public E getFirst()    |     返回此列表中的第一个元素     |
  |     public E getLast      |    返回此列表中的最后一个元素    |
  |  public E removeFirst()   |   从此列表删除并返回第一个元素   |
  |   public E removeLast()   | 从此列表中删除并返回最后一个元素 |

  - 应用场景：1、用来设计队列；2、用来设计栈

---

## Set集合

### 特点：

+ **无序**：添加数据的顺序和获取出的数据顺序不一致；
+ **不重复**
+ **无索引**
  - HashSet：无序、不重复、无索引
  - LinkedHashSet：有序、不重复、无索引
  - TreeSet：按照大小默认升序排序、不重复、无索引

> Set要用到的常用方法，基本上就是Collection提供的！！！
>
> 自己几乎没有额外新增一些常用功能！

### HashSet集合去重复的机制

+ 如果希望Set集合认为两个内容一样的对象是重复的，必须重写对象的hashCode()和equals()方法

+ @Data会自动重写这两个方法

### HashSet、LinkedHashSet 底层原理

+ 基于哈希表（数组、链表、红黑树）实现的

### TreeSet集合

+ 特点：不重复、无索引、可排序（默认升序排序，按照元素的大小，由小到大排序）
+ 底层是基于红黑树实现的排序

注意：

+ 对于数值类型：Integer，Double，默认按照数值本身的大小进行升序排序。
+ 对于字符串类型：默认按照首字符的编号升序排序。
+ 对于自定义类型如Student对象，TreeSet默认是无法直接排序的。

---

## Map集合

### 认识Map集合

+ Map集合也被叫做“键值对集合”，格式：{Key1=value1,key2=value2...}
+ Map集合的**所有键是不允许重复的**，但值可以重复，键和值是一一对应的，每一个键只能找到自己对应的值

### Map集合体系的特点

**注意：Map系列集合的特点都是有键决定的，值只是一个附属品，值是不做要求的**

+ HashMap（由键决定特点）：无序、不重复、无索引；（用的最多）
+ LinkedHashMap（由键决定特点）：**有序**、不重复、无索引。
+ TreeMap（由键决定特点）：**按照大小默认升序排序**（只对键排序）、不重复、无索引

### Map集合的常用方法

|                  方法名称                  |                 说明                 |
| :----------------------------------------: | :----------------------------------: |
|        public V put(K key,V value)         |               添加元素               |
|             public int size()              |            获取集合的大小            |
|            public void clear()             |               清空集合               |
|          public boolean isEmpty()          | 判断集合是否为空，为空返回true，反之 |
|          public V get(Object key)          |           跟据键获取对应值           |
|        public V remove(Object key)         |          跟据键删除整个元素          |
|   public boolean containsKey(Object key)   |          判断是否包含某个键          |
| public boolean containsValue(Object value) |          判断是否包含某个值          |
|           public Set<K> keySet()           |           获取全部键的集合           |
|       public Collection<V> values()        |         获取Map集合的全部值          |

### Map集合的遍历方式

#### 1、键找值

+ 先获取Map集合全部的键，再通过遍历键来找值

```java
//1、提起Map集合的全部键到一个Set集合中去
Set<String> keys=map.keySet();
//2、遍历Set集合，得到每一个键
for(String key : keys){
    //3、跟据键去找值
    Integer value = map.get(key);
    System.out.println(key+"="+value);
}
```

#### 2、键值对

+ 把“键值对”看成一个整体进行遍历（难度较大）

|         Map提供的方法         |          说明          |
| :---------------------------: | :--------------------: |
| Set<Map.Entry<K,V>>entrySet() | 获取所有“键值对”的集合 |

```java
//1、把Map集合转换成Set集合，里面的元素类型都是键值对类型
Set<Map.Entry<String,Double>> entries=map.entrySet(); //.var快捷键
//2、遍历Set集合，得到每一个键值对类型元素
for(Map.Entry<String,Double> entry:entrys){
    String key=entry.getKey();
    double value=entry.getValue();
    System.out.println(key+"===>"+value);
}
```

#### 3、Lambda表达式

+ 需要用到Map的如下方法

|                           方法名称                           |         说明          |
| :----------------------------------------------------------: | :-------------------: |
| default void forEach(BiConsumer<? super k, ? super V> action) | 结合Lambda遍历Map集合 |

```java
map.forEach((k,v)->{
    System.out.println(k+"--->"+v);
});
```

---

## Stream流

### 认识Stream流

+ 可以用于**操作集合或者数组**

+ 优势：Stream流大量的结合了Lambda的语法风格来编程，功能性能强大，代码简洁，可读性好。

### Stream流的使用步骤

1、获取Stream流

2、调用流水线的各种方法，进行数据处理

3、获取处理的结果（遍历、统计、收集到一个新集合中返回）

### 获取Stream流

+ 获取**集合**的Stream流

```java
//1、获取集合的Stream流：调用集合提供的Stream方法
Collection<String> list= new ArrayList<>();
Stream<String> s1= list.stream();
//2、Map集合
Map<String,Integer> map = new HashMap<>();
//获取键流
Stream<String> s2= map.keySet().stream();
//获取值流
Stream<Integer> s3= map.values().stream();
//获取键值对流
Stream<Map.Entry<String,Integer>> s4 = map.entrySet().stream();
```

+ 获取**数组**的Stream流

```java
String[] names;
//1、获取当前数组的Stream流
Stream<String> s5 = Array.stream(names);
//2、获取当前接受数据的Stream流
Stream<String> s6= Stream.of(names);
```

### Stream流提供的方法

+ 中间方法指的是调用完成后会返回新的Stream流，可以继续使用（支持链式编程）

|                  Stream 提供的常用中间方法                   |                说明                |
| :----------------------------------------------------------: | :--------------------------------: |
|      `Stream<T> filter(Predicate<? super T> predicate)`      |     用于对流中的数据进行过滤。     |
|                     `Stream<I> sorted()`                     |        对元素进行升序排序。        |
|     `Stream<I> sorted(Comparator<? super I> comparator)`     |         按照指定规则排序。         |
|               `Stream<T> limit(long maxSize)`                |          获取前几个元素。          |
|                   `Stream<T> skip(long n)`                   |          跳过前几个元素。          |
|                    `Stream<T> distinct()`                    |        去除流中重复的元素。        |
| `<R> Stream<R> map(Function<? super T, ? extends R> mapper)` | 对元素进行加工，并返回对应的新流。 |
|      `static <T> Stream<T> concat(Stream a, Stream b)`       |    合并 a 和 b 两个流为一个流。    |

### 终结方法、收集Stream流

#### Stream流的终结方法

+ 终结方法指的是调用完成后，不会返回新Stream了，没法继续使用流了

|              Stream 提供的常用终结方法              |             说明             |
| :-------------------------------------------------: | :--------------------------: |
|           `void forEach(Consumer action)`           | 对此流运算后的元素执行遍历。 |
|                   `long count()`                    |  统计此流运算后的元素个数。  |
| `Optional<I> max(Comparator<? super I> comparator)` | 获取此流运算后的最大值元素。 |
| `Optional<I> min(Comparator<? super I> comparator)` | 获取此流运算后的最小值元素。 |

#### 收集Stream流

+ 把Stream流操作后的结果转回到集合或数组中去返回
+ 注意：流只能收集一次.

| Stream 提供的常用终结方法        | 说明                                       |
| -------------------------------- | ------------------------------------------ |
| `R collect(Collector collector)` | 把流处理后的结果收集到一个指定的集合中去。 |
| `Object[] toArray()`             | 把流处理后的结果收集到一个数组中去。       |

| Collectors 工具类提供的具体收集方式                          | 说明                         |
| ------------------------------------------------------------ | ---------------------------- |
| `public static <T> Collector<T> toList()`                    | 把元素收集到 `List` 集合中。 |
| `public static <T> Collector<T> toSet()`                     | 把元素收集到 `Set` 集合中。  |
| `public static Collector toMap(Function keyMapper, Function valueMapper)` | 把元素收集到 `Map` 集合中。  |

### 方法中可变参数

+ 一种特殊形参，定义在方法、构造器的新参列表中，格式是：`数据类型...参数名称`

```java
public static void sum(int...num){
}
```

+ 特点：可以不传数据；可以传一个或者同时传多个数据给它；也可以传一个数组给它。

+ 好处：常常用来灵活的接收数组。

+ 注意事项：

  - 可变参数在方法内部是一个数组。
  - 一个新参列表中可变参数只能有一个
  - 可变参数必须放在新参列表的最后面

  ```java
  public static void sum(int age,int...nums){
  }
  ```

### collections工具类

+ 是一个用来操作集合的工具类

| 方法名称                                                     | 说明                                                     |
| :----------------------------------------------------------- | :------------------------------------------------------- |
| `public static <T> boolean addAll(Collection<? super T> c, T... elements)` | 给集合批量添加元素。                                     |
| `public static void shuffle(List<?> list)`                   | 打乱 List 集合中的元素顺序。                             |
| `public static <T> void sort(List<T> list)`                  | 对 List 集合中的元素进行升序排序（默认使用自然顺序）。   |
| `public static <T> void sort(List<T> list, Comparator<? super T> c)` | 对 List 集合中的元素，按照比较器对象指定的规则进行排序。 |
