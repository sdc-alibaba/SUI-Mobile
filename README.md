SUI Mobile

# 环境

执行 `jekyll serve` 打开本地服务器.

如果你的系统中没有ruby，请先[安装ruby](https://www.ruby-lang.org/en/documentation/installation/)。然后再安装 `jekyll` 和 `rouge` （执行 `gem install jekyll` 和 `gem install rouge`）。
如果发现 `gem install` 失败，可能是因为 gem 服务器被和谐，参考[淘宝gem镜像](https://ruby.taobao.org/)

# 分支

***由于启用了服务器端编译，发布代码的时候会有比较长的编译时间，请耐心等待。***

dev 分支上是最新的代码，daily分支只是在发布代码的时候用。
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


## 封装和解耦

代码要尽量减少耦合，F7 中的 JS 代码存在大量耦合，迁移的时候主意每一个JS插件都要是独立的zepto插件，独立为一个文件并且最好不要依赖其他插件（除了依赖zepto）。

比如有些组件会依赖 `clicks.js`，那么要把 `clicks.js` 中的代码复制到组件的js文件中去。
一些组件会提供 app.xxx 方法，那么应该把他改成 $.xxx，但是注意不要和 zepto 默认方法冲突
有些组件依赖 `dom7` 要改成 `zepto` （大部分api都是一致的）

参考 `tabs.js` 的实现。

## mixins

我们使用 `autoprefix` 来做浏览器前缀的补全，所以所有只是用来补全浏览器前缀的mixin都要去掉，目前已经在 `mixins.less` 文件中删除了这些mixin，被删除的部分以注释形式写在文件末尾方便查看。
