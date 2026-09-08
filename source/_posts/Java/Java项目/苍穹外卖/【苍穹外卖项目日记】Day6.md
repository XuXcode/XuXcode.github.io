---
title: 【苍穹外卖项目日记】Day6
date: 2026-09-01
description: 苍穹外卖项目实战日记第六天，基于 ECharts 完成营业额、用户、订单统计与销量 TOP10 功能开发。
categories:
  - Java
  - Java项目
  - 苍穹外卖
---
# 【苍穹外卖|项目日记】Day6

## 今日完成的任务

1、了解并学习echarts相关的知识点

2、完成营业额统计、用户统计、订单统计、销量TOP10功能开发

3、导入工作台开发代码

## 今日收获

### 1、使用StringUtils的join方法将List中的数据转换成由符号分隔的字符串

```java
return TurnoverReportVO
                .builder()
                .dateList(StringUtils.join(dateList , ","))
                .turnoverList(StringUtils.join(turnoverList,","))
                .build();
```

### 2、使用封装map将字段传入mapper

通过map将查询的条件封装，然后传入mapper进行动态SQL条件查询

MyBatis 中完全可以直接使用 Map 作为参数传递给 Mapper 方法，不一定非要封装到实体类中

```java
 Map<String, Object> map = new HashMap();
            map.put("begin",beginTime);
            map.put("end",endTime);
            map.put("status", Orders.COMPLETED);
            Double turnover = orderMapper.sumByMap(map);
```

```java
<select id="sumByMap" resultType="java.lang.Double">
        select sum(amount)
        from orders
        <where>
            <if test="status != null">
                and status = #{status}
            </if>

            <if test="begin != null">
                and order_time &gt; #{begin}
            </if>

            <if test="end != null">
                and order_time &lt; #{end}
            </if>
        </where>
    </select>
```

+ 注意：因为 MyBatis 的 SQL 是写在 XML 文件中的，而 `<`、`>` 本身属于 XML 的特殊符号，其中 `<` 会被 XML 解析器认为是标签的开始。为了避免 XML 解析错误，需要将比较符号进行转义。

| SQL符号 | XML中推荐写法 |
| ------- | ------------- |
| `<`     | `&lt;`        |
| `<=`    | `&lt;=`       |
| `>`     | `&gt;`        |
| `>=`    | `&gt;=`       |

### 3、共用同一个方法来统计用户数量

```java
Map map = new HashMap();
            map.put("end",endTime);

            //统计总用户数量
            Integer totalUser = userMapper.countByMap(map);

            map.put("begin",beginTime);
            Integer newUser =  userMapper.countByMap(map);
```

+ 一个非常巧妙的设计点，先put endTime统计迄今为止的用户数量，再put beginTime统计时间段内的用户也就是所谓的新增用户

### 4、使用Stream流提取DTO的List集合中某一个字段的数据转换为List

```java
List<GoodsSalesDTO> goodsSalesDTOList = orderMapper.getSalesTop10(beginTime, endTime);

List<String> names = goodsSalesDTOList.stream().map(GoodsSalesDTO::getName).collect(Collectors.toList());
String nameList = StringUtils.join(names, ",");

List<Integer> numbers = goodsSalesDTOList.stream().map(GoodsSalesDTO::getNumber).collect(Collectors.toList());
String numberList = StringUtils.join(numbers, ",");
```

### 5、使用Apache POI导出运营数据Excel报表

1). 设计Excel模板文件

2). 查询近30天的运营数据

3). 将查询到的运营数据写入模板文件

4). 通过输出流将Excel文件下载到客户端浏览器

## 杂项知识点

### Apache POI

Apache POI 是一个处理Miscrosoft Office各种文件格式的开源项目。简单来说就是，我们可以使用 POI 在 Java 程序中对Miscrosoft Office各种文件进行读写操作。

一般情况下，POI 都是用于操作 Excel 文件。

