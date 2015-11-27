SUI Mobile

# 环境

执行 `jekyll serve` 打开本地服务器.

如果你的系统中没有ruby，请先[安装ruby](https://www.ruby-lang.org/en/documentation/installation/)。然后再安装 `jekyll` 和 `rouge` （执行 `gem install jekyll` 和 `gem install rouge`）。
如果发现 `gem install` 失败，可能是因为 gem 服务器被和谐，参考[淘宝gem镜像](https://ruby.taobao.org/)

# 版本号升级

每次升级发布，__需要同时__ 将 `package.json` 和 `_config.yml` 两个文件里的版本号字段更新升级一次。


# 分支

***由于启用了服务器端编译，发布代码的时候会有比较长的编译时间，请耐心等待。***

强调：开发主分支是 __dev__ 分支，不是master。pullrequest也是向 __dev__ 分支发。

__dev__ 分支上是最新的代码，daily分支只是在发布代码的时候用。
开发新功能的时候，从dev创建一个新分支，以功能名字命名，比如 form。杜绝无意义的分支名，杜绝以人名作为分支名。

# 迁移代码的一些主意事项

使用这个版本的 [F7](https://github.com/sdc-fe/Framework7-Plus)


## 分类

  - 导航和布局：导航栏和工具栏（ratchet），标签页，栅格
  - 表单：按钮（ratchet），表单
  - 列表：列表，accordion, 卡片
  - 滚动：滚动条，下拉刷新，无限滚动
  - 对话框和多媒体：弹层，preloader,图片浏览器，幻灯片

## 兼容性

兼容 iOS 6+, Android 4.0+

我们只考虑手机，所以ipad的兼容代码可以直接删掉。

## REM

通过REM实现整页缩放，除了字体大小以外，任何以前以px和em为单位的地方都要改成REM。
REM 规则是： 默认情况下，320宽度的设备对应 `font-size: 20px`，所以 `1rem` 对应 `20px`。
比如 `height: 44px` 应该修改成 `height: 2.2rem`。


## 颜色规范

不要以颜色名来命名 class，比如 `color-red` 这样的要全部干掉。
现在有四种主色 `@color-primary`, `@color-success`, `@color-danger`, `@color-warning`。 F7 中所有直接用类似 `@blue` `@red` 这样的颜色都要换调。


## 封装和解耦

代码要尽量减少耦合，F7 中的 JS 代码存在大量耦合，迁移的时候主意每一个JS插件都要是独立的zepto插件，独立为一个文件并且最好不要依赖其他插件（除了依赖zepto）。

比如有些组件会依赖 `clicks.js`，那么要把 `clicks.js` 中的代码复制到组件的js文件中去。
一些组件会提供 app.xxx 方法，那么应该把他改成 $.xxx，但是注意不要和 zepto 默认方法冲突
有些组件依赖 `dom7` 要改成 `zepto` （大部分api都是一致的）

参考 `tabs.js` 的实现。

## mixins

我们使用 `autoprefix` 来做浏览器前缀的补全，所以所有只是用来补全浏览器前缀的mixin都要去掉，目前已经在 `mixins.less` 文件中删除了这些mixin，被删除的部分以注释形式写在文件末尾方便查看。

## 单元测试

JS组件都需要写单元测试（因此JS组件要先改造成一个独立的 zepto 插件），单元测试需要包括以下几方面：

- 接口存在性
- 通过 JS 调用API，包括不同的参数，包括返回值
- 模拟用户操作，测试组件是否正常工作。
- 测试事件是否正确触发，以及参数是否正确。

单元测试不要怕麻烦，越详细越好，具体请参考 `tabs.js`。

## JS 组件的一些依赖问题

JS 组件一般会有这几种依赖

### 默认配置
很多组件会用到 `app.params.xxx` ，这是组件的默认配置，以前是在 F7 初始化的时候配置的。
最好的方法是改成组件自己的配置，比如在 modal 组件中，全部改成 `$.modal.prototype.defaults.xxx` ，然后把默认配置全部写到 `$.modal.prototype.defaults` 中。

### Dom7
在 F7 中，`$` 其实是 `Dom7`，我们现在改成了 `Zepto`。它们大部分API是一致的，但是部分API有区别，比如 Dom7 有一个 `transitionEnd` 方法，Zepto 中没有。
如果遇到这种情况，直接把这个方法加到 `zepto-adapter.js` 文件中。


## fastclick
我们引入了最好的 [fastclick](https://github.com/ftlabs/fastclick) 库赖解决点击穿透问题，所以不要用 zepto 提供的 `tab` 事件，它是由点击穿透的问题的，直接绑定 `click` 事件即可。
