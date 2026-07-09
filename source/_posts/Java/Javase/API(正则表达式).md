---
title: API(正则表达式)
date: 2025-12-19
categories:
  - Java
  - Javase
tags:
  - java/api
  - 正则表达式
  - regex
---
# 正则表达式

## 概念

+ 正则表达式就是用来验证各种字符串的规则。它内部描述了一些规则，我们可以验证用户输入的字符串是否匹配这个规则。

## 正则表达式——字符类

| 正则表达式    | 说明                                            |
| ------------- | ----------------------------------------------- |
| `[abc]`       | 代表 a 或者 b，或者 c 字符中的一个。            |
| `[^abc]`      | 代表除 a、b、c 以外的任何字符。                 |
| `[a-z]`       | 代表 a-z 的所有小写字符中的一个。               |
| `[A-Z]`       | 代表 A-Z 的所有大写字符中的一个。               |
| `[0-9]`       | 代表 0-9 之间的某一个数字字符。                 |
| `[a-zA-Z0-9]` | 代表 a-z 或者 A-Z 或者 0-9 之间的任意一个字符。 |
| `[a-dm-p]`    | a 到 d 或 m 到 p 之间的任意一个字符。           |

+ 示例代码

```Java
public class RegexDemo2 {
    public static void main(String[] args) {
        //public boolean matches(String regex):判断是否与正则表达式匹配，匹配返回true
        // 只能是a b c
        System.out.println("-----------1-------------");
        System.out.println("a".matches("[abc]")); // true
        System.out.println("z".matches("[abc]")); // false

        // 不能出现a b c
        System.out.println("-----------2-------------");
        System.out.println("a".matches("[^abc]")); // false
        System.out.println("z".matches("[^abc]")); // true
        System.out.println("zz".matches("[^abc]")); //false
        System.out.println("zz".matches("[^abc][^abc]")); //true

        // a到zA到Z(包括头尾的范围)
        System.out.println("-----------3-------------");
        System.out.println("a".matches("[a-zA-z]")); // true
        System.out.println("z".matches("[a-zA-z]")); // true
        System.out.println("aa".matches("[a-zA-z]"));//false
        System.out.println("zz".matches("[a-zA-Z]")); //false
        System.out.println("zz".matches("[a-zA-Z][a-zA-Z]")); //true
        System.out.println("0".matches("[a-zA-Z]"));//false
        System.out.println("0".matches("[a-zA-Z0-9]"));//true


        // [a-d[m-p]] a到d，或m到p
        System.out.println("-----------4-------------");
        System.out.println("a".matches("[a-d[m-p]]"));//true
        System.out.println("d".matches("[a-d[m-p]]")); //true
        System.out.println("m".matches("[a-d[m-p]]")); //true
        System.out.println("p".matches("[a-d[m-p]]")); //true
        System.out.println("e".matches("[a-d[m-p]]")); //false
        System.out.println("0".matches("[a-d[m-p]]")); //false

        // [a-z&&[def]] a-z和def的交集。为:d，e，f
        System.out.println("----------5------------");
        System.out.println("a".matches("[a-z&[def]]")); //false
        System.out.println("d".matches("[a-z&&[def]]")); //true
        System.out.println("0".matches("[a-z&&[def]]")); //false

        // [a-z&&[^bc]] a-z和非bc的交集。(等同于[ad-z])
        System.out.println("-----------6------------_");
        System.out.println("a".matches("[a-z&&[^bc]]"));//true
        System.out.println("b".matches("[a-z&&[^bc]]")); //false
        System.out.println("0".matches("[a-z&&[^bc]]")); //false

        // [a-z&&[^m-p]] a到z和除了m到p的交集。(等同于[a-1q-z])
        System.out.println("-----------7-------------");
        System.out.println("a".matches("[a-z&&[^m-p]]")); //true
        System.out.println("m".matches("[a-z&&[^m-p]]")); //false
        System.out.println("0".matches("[a-z&&[^m-p]]")); //false

    }
}
```

---

## **正则表达式-逻辑运算符**

| 符号 |   说明   |
| :--: | :------: |
|  &&  |   非且   |
|  \|  |   或者   |
|  \   | 转义字符 |

+ 代码示例：

```Java
public class Demo {
  public static void main(String[] args) {
    String str = "had";
    //1.要求字符串是小写辅音字符开头，后跟ad
    String regex = "[a-z&&[^aeiou]]ad";
    System.out.println("1." + str.matches(regex));
    //2.要求字符串是aeiou中的某个字符开头，后跟ad
    regex = "[a|e|i|o|u]ad";//这种写法相当于：regex = "[aeiou]ad";
    System.out.println("2." + str.matches(regex));
  }
}
```

```Java
public class RegexDemo3 {
    public static void main(String[] args) {
        // \ 转义字符 改变后面那个字符原本的含义
        //练习:以字符串的形式打印一个双引号
        //"在Java中表示字符串的开头或者结尾

        //此时\表示转义字符，改变了后面那个双引号原本的含义
        //把他变成了一个普普通通的双引号而已。
        System.out.println("\"");

        // \表示转义字符
        //两个\的理解方式：前面的\是一个转义字符，改变了后面\原本的含义，把他变成一个普普通通的\而已。
        System.out.println("c:Users\\moon\\IdeaProjects\\basic-code\\myapi\\src\\com\\itheima\\a08regexdemo\\RegexDemo1.java");

    }
}
```

---

## **正则表达式-预定义字符**

| 代码 | 含义       | 等价字符类                       | 解释                                                         |
| ---- | ---------- | -------------------------------- | ------------------------------------------------------------ |
| `.`  | 任意字符   | `[^\n\r]` (在多行模式下可能不同) | 匹配除换行符之外的任意单个字符。                             |
| `\d` | 数字       | `[0-9]`                          | 匹配任意一个数字字符 (0 到 9)。                              |
| `\D` | 非数字     | `[^0-9]`                         | 匹配任意一个不是数字的字符。                                 |
| `\s` | 空白字符   | `[ \t\n\x0B\f\r]`                | 匹配任意一个空白字符，包括空格、制表符、换行符、垂直制表符、换页符和回车符。 |
| `\S` | 非空白字符 | `[^ \t\n\x0B\f\r]`               | 匹配任意一个不是空白的字符。                                 |
| `\w` | 单词字符   | `[a-zA-Z0-9_]`                   | 匹配任意一个字母、数字或下划线。                             |
| `\W` | 非单词字符 | `[^a-zA-Z0-9_]`                  | 匹配任意一个不是字母、数字或下划线的字符。                   |

+ 代码示例：

  ```Java
  public class Demo {
    public static void main(String[] args) {
          //.表示任意一个字符
          System.out.println("你".matches("..")); //false
          System.out.println("你".matches(".")); //true
          System.out.println("你a".matches(".."));//true
  
          // \\d 表示任意的一个数字
          // \\d只能是任意的一位数字
          // 简单来记:两个\表示一个\
          System.out.println("a".matches("\\d")); // false
          System.out.println("3".matches("\\d")); // true
          System.out.println("333".matches("\\d")); // false
  
          //\\w只能是一位单词字符[a-zA-Z_0-9]
          System.out.println("z".matches("\\w")); // true
          System.out.println("2".matches("\\w")); // true
          System.out.println("21".matches("\\w")); // false
          System.out.println("你".matches("\\w"));//false
  
          // 非单词字符
          System.out.println("你".matches("\\W")); // true
          System.out.println("-----------------------------------------");
          // 以上正则匹配只能校验单个字符。
  
  
          // 必须是数字 字母 下划线 至少 6位
          System.out.println("2442fsfsf".matches("\\w{6,}"));//true
          System.out.println("244f".matches("\\w{6,}"));//false
  
          // 必须是数字和字符 必须是4位
          System.out.println("23dF".matches("[a-zA-Z0-9]{4}"));//true
          System.out.println("23 F".matches("[a-zA-Z0-9]{4}"));//false
          System.out.println("23dF".matches("[\\w&&[^]]{4}"));//true
          System.out.println("23_F".matches("[\\w&&[^_]]{4}"));//false
    }
  }
  ```

## **正则表达式-数量词**

| 量词     | 含义        | 说明                                                         |
| -------- | ----------- | ------------------------------------------------------------ |
| `X?`     | 0 次或 1 次 | 匹配前面的元素 X 0 次或 1 次。等价于 `{0,1}`。               |
| `X*`     | 0 次到多次  | 匹配前面的元素 X 0 次、1 次、2 次...任意次数。等价于 `{0,}`。 |
| `X+`     | 1 次或多次  | 匹配前面的元素 X 1 次、2 次、3 次...任意多次。等价于 `{1,}`。 |
| `X{n}`   | 恰好 n 次   | 匹配前面的元素 X 恰好 n 次。                                 |
| `X{n,}`  | 至少 n 次   | 匹配前面的元素 X 至少 n 次（n 次、n+1 次、n+2 次...）。      |
| `X{n,m}` | n 到 m 次   | 匹配前面的元素 X 从 n 次到 m 次之间的任意次数（包含 n 和 m）。 |

+ 代码示例：

```Java
public class Demo {
  public static void main(String[] args) {
     // 必须是数字 字母 下划线 至少 6位
        System.out.println("2442fsfsf".matches("\\w{6,}"));//true
        System.out.println("244f".matches("\\w{6,}"));//false

        // 必须是数字和字符 必须是4位
        System.out.println("23dF".matches("[a-zA-Z0-9]{4}"));//true
        System.out.println("23 F".matches("[a-zA-Z0-9]{4}"));//false
        System.out.println("23dF".matches("[\\w&&[^]]{4}"));//true
        System.out.println("23_F".matches("[\\w&&[^_]]{4}"));//false
  }
}
```
