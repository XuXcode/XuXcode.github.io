---
title: 【苍穹外卖项目日记】Day2
date: 2026-07-03
categories:
  - Java
  - Java项目
  - 苍穹外卖
---
# 【苍穹外卖|项目日记】Day2

### 今日完成的任务：

+ 实现编辑员工的接口
+ 导入分类管理功能模块
+ 实现公共字段自动填充

### 今日收获：

### 1、编辑员工信息＋查询回显

1、在写根据id查询员工信息的实现类时，要重新将传回的员工密码进行打码处理，否则数据库中的密码会随着这个方法传回至前端，导致信息泄露

```java
@Override
public Employee getById(Long id) {
    Employee employee = employeeMapper.getById(id);
    employee.setPassword("****");
    return employee;
}
```

2、在完成update实现类的时候，可以使用BeanUils工具类的方法，将employeeDTO的对象属性拷贝到Employee，可以与其他方法共用mapper xml映射中的update方法，提高了代码的复用率

```java
@Override
    public void update(EmployeeDTO employeeDTO) {
        Employee employee = new Employee();
        // 对象属性拷贝
        BeanUtils.copyProperties(employeeDTO, employee);
		...
        ...
        employeeMapper.update(employee);
    }
```

### 2、导入分类管理功能模块

1、导入时要按照mapper-->service-->controller依次导入，这样代码不会显示相应的报错

2、导入后要整个项目进行编译

### 3、公共字段自动填充

#### 实现思路(枚举、注解、AOP、反射)

+ 自定义注解 `AutoFill`，用于标识需要进行公共字段字段填充的方法

  ```java
  @Target(ElementType.METHOD) // 表示该注解用于方法上
  @Retention(RetentionPolicy.RUNTIME) // 表示该注解在运行时生效
  public @interface AutoFill {
      OperationType value(); // 用于指定填充数据的操作类型,枚举值
  }
  ```

+ 自定义切面类`AutoFillAspect`，统一拦截加入了`AutoFill`注解的方法，通过反射为公共字段赋值

+ 在Mapper的方法上加入`AutiFill`注解

### 杂项知识点：

### 总结：
