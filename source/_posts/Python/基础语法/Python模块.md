---
title: Python模块
date: 2026-04-18
categories:
  - Python
  - 基础语法
tags:
  - Python
  - 模块

---
# Python模块

+ 介绍：Python模块(module)：一个.py文件就是一个模块，模块是Python程序的基本组成单位。在模块中可以定义变量、函数、类以及可执行的代码。

## 导入模块

+ 在使用模块中提供的功能之前，必须得先导入，再使用。

+ 具体语法：

  | 导入形式                            | 代码样例                             | 调用方式        | 调用方式示例              |
  | :---------------------------------- | :----------------------------------- | :-------------- | :------------------------ |
  | `import 模块名`                     | `import random, os`                  | `模块名.功能名` | `random.randint(10, 100)` |
  | `import 模块名 as 别名`             | `import random as rd`                | `别名.功能名`   | `rd.randint(10, 100)`     |
  | `from 模块名 import 功能名`         | `from random import randint, choice` | `功能名`        | `randint(10, 100)`        |
  | `from 模块名 import 功能名 as 别名` | `from random import randint as rint` | `别名`          | `rint(10, 100)`           |
  | `from 模块名 import *`              | `from random import *`               | `功能名`        | `randint(10, 100)`        |

## 自定义模块

+ 开发复杂项目是，为了让结构清晰，便于项目维护及代码复用，可能会把一个项目拆分成若干个模块
+ 每一个python文件都可以作为一个模块，模块的名字就是文件的名字（建议使用python标识符定义，规范命名）

### __ _name_ _ _

+ Python中的内置变量，表示当前模块的名字(直接运行当前模块，`_ _ name _ _`的值为“`_ _main_ _`”；当该模块被导入时，`_ _name_ _`的值就是模块名)

### _ _ all_ _

+ `_ _all_ _`是一个模块级别的特殊变量，用于指定`from 模块名 import *`时会导入哪些功能(*通配了哪些功能)。 

+ 注意：`_ _all_ _`控制的是`from ... import *`时，要导入的功能，并不会影响直接导入具体的功能（如：`from ... import`功能）

## 软件包(package)

+ 包：本质就是一个文件夹，该文件夹中可以包括若干个python模块(.py文件)，文件夹下还包含了一个`_ _ init _ _ . py`。
+ 作用：模块文件较多时，用来管理多个模块。（包的本质也是一个模块）
+ `_ _ init _ _.py`文件的作用：
  - 标识这是一个包，而不是普通的文件夹
  - 控制在`import *`时导入的模块列表(`_ _all_ _`变量)

### 包的导入方式

| 导入形式                         | 代码样例                                  | 调用方式             | 调用示例                        |
| :------------------------------- | :---------------------------------------- | :------------------- | :------------------------------ |
| `import 包名.模块名`             | `import utils.my_fun`                     | `包名.模块名.功能名` | `utils.my_fun.log_separator1()` |
| `from 包名 import 模块名`        | `from utils import my_fun`                | `模块名.功能名`      | `my_fun.log_separator1()`       |
| `from 包名 import *`             | `from utils import *`                     | `模块名.功能名`      | `my_fun.log_separator1()`       |
| `from 包名.模块名 import 功能名` | `from utils.my_fun import log_separator1` | `功能名`             | `log_separator1()`              |
| `from 包名.模块名 import *`      | `from utils.my_fun import *`              | `功能名`             | `log_separator1()`              |

+ 注意：在通过`from 包名 import *`导入全部模块的时候，需要在`_ _ init _ _.py`中添加`_ _all_ _=[]`，控制允许导入的模块列表。
