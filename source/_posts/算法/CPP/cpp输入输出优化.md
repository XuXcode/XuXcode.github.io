---
title: cpp输入输出优化
date: 2025-11-20
description: 本文讲解 C++ 输入输出优化技巧，包括 ios::sync_with_stdio 与 cin.tie。
categories:
  - 算法
  - CPP
tags:
  - 算法
  - CPP
  - ACM

---
# cpp输入输出优化

```cpp
ios::sync_with_stdio(false); //取消C语言输入输出缓冲区的同步
cin.tie(0); //取消了cin和cout的绑定
```
