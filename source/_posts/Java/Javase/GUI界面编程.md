---
title: GUI界面编程
date: 2025-12-19
categories:
  - Java
  - Javase
tags:
  - java/basic
  - GUI
  - Swing
---
# GUI界面编程（了解）

## Swing

+ JFrame:窗口
+ JPanel:用于组织其他组件的容器
+ JButton:按钮组件
+ JTextField:输入框
+ JTable:表格

```java
import javax.swing.*;

public class JFrameDemo1 {
    static void main(String[] args) {
        JFrame jf = new JFrame("登录窗口"); // 创建一个标题为"登录窗口"的 JFrame 窗口对象
        jf.setSize(400, 300);
        jf.setLocationRelativeTo(null); //设置窗口居中
        jf.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);//关闭窗口退出程序

        JPanel jp = new JPanel(); // 创建一个面板容器对象，用于放置组件
        jf.add(jp);  // 将面板添加到主窗口中

        JButton jb = new JButton("登录"); // 创建一个文本为"登录"的按钮组件
        jb.setBounds(100, 100, 10, 50);
        jp.add(jb); // 将按钮添加到面板中

        // 设置窗口可见，这是显示窗口的关键步骤
        jf.setVisible(true); // 添加这行来显示窗口
    }
}
```



## 常见的布局管理器

+ FlowLayout
+ BorderLatout
+ GridLayout
+ BoxLayout

## 事件处理

+ GUI编程中，事件的处理时通过事件监听器来完成的。
+ 例如：
  - 点击监听器 ActionListener
  - 按键事件监听器 KeyListener
  - 鼠标行为监听器 MouseListener
  - ......

## 事件的几种常见写法

+ 第1种：直接提供实现类，用于创建事件监听对象
+ 第2种：直接使用匿名内部类的对象，代表事件的监听对象
+ 第3种：自定义窗口，让窗口实现对象接口
