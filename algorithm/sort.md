说到算法，入门级的算是排序算法了。还记得读大学时，学的第一个是冒泡排序。初次接触算法，觉得很神秘，一个冒泡竟然搞了很久。

这篇文章主要介绍一些经典的排序算法，由于博主现在做 web 前端方面的工作，所以编程语言就使用 JavaScript 了。不过，如果是学其他语言的人，读懂大致的思路是没问题的，完全可以仿照文章中 JavaScript 版的代码进行重写。

# 概述
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200505113835960.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3pob3VsZWkxOTk1,size_16,color_FFFFFF,t_70)

排序算法是非常基础的算法之一，在我们生活中应用相当广泛，比如我们逛购物网站时，会按商品的销量去检索。上图列出了基本的排序的比较情况，根据各自的时间复杂度和空间复杂度，我们可以知道算法的好坏。

# 算法
限于篇幅原因，这里不会给出所有排序算法的代码。主要针对一些常用和面试常考的算法，给出代码示例，所有算法均为**从小到大**排序。

## 插入排序
插入排序是一种最简单直观的排序算法，它的原理是通过构建有序序列，对于未排序数据，在已排序序列中从后向前扫描，找到相应位置并插入。

```js
function sort(arr) {
    var arrCopy = arr.concat();
    for (var i = 1; i < arrCopy.length; i++) {
        var prevIndex = i - 1;
        var currentValue = arrCopy[i];
        while (prevIndex >= 0 && currentValue < arrCopy[prevIndex]) {
            arrCopy[prevIndex + 1] = arrCopy[prevIndex];
            prevIndex--;
        }
        arrCopy[prevIndex + 1] = currentValue;
    }
    return arrCopy;
}
```

## 选择排序
选择排序是一种简单直观的排序算法，无论什么数据进去都是 O(n²) 的时间复杂度。

它的原理是首先在未排序序列中找到最小（大）元素，存放到排序序列的起始位置，再从剩余未排序元素中继续寻找最小（大）元素，然后放到已排序序列的末尾。

重复上述步骤，直到所有元素均排序完毕。

```js
function selectionSort(arr) {
    var arrCopy = arr.concat();
    var length = arrCopy.length;
    var minIndex, temp;
    for(var i = 0; i < length - 1; i++) {
        minIndex = i;
        for(var j = i + 1; j < length; j++) {
            if (arrCopy[j] < arrCopy[minIndex]) {
                minIndex = j;
            }
        }
        temp = arrCopy[i];
        arrCopy[i] = arrCopy[minIndex];
        arrCopy[minIndex] = temp;
    }
    return arrCopy;
}
```

## 冒泡排序
冒泡排序（Bubble Sort）也是一种简单直观的排序算法。它重复地走访过要排序的数列，一次比较两个元素，如果他们的顺序错误就把他们交换过来。

走访数列的工作是重复地进行直到没有再需要交换，也就是说该数列已经排序完成。这个算法的名字由来是因为越小的元素会经由交换慢慢“浮”到数列的顶端。

```js
function bubbleSort(arr) {
    var len = arr.length;
    for (var i = 0; i < len - 1; i++) {
        for (var j = 0; j < len - 1 - i; j++) {
            if (arr[j] > arr[j + 1]) {        // 相邻元素两两对比
                var temp = arr[j + 1];        // 元素交换
                arr[j + 1] = arr[j];
                arr[j] = temp;
            }
        }
    }
    return arr;
}
```

## 快速排序
快速排序是由东尼·霍尔所发展的一种排序算法。在平均状况下，排序 n 个项目要 Ο(nlogn) 次比较。在最坏状况下则需要 Ο(n2) 次比较，但这种状况并不常见。

事实上，快速排序通常明显比其他 Ο(nlogn) 算法更快，因为它的内部循环（inner loop）可以在大部分的架构上很有效率地被实现出来。

```js
function quickSort(left, right, arr) {
    if (left >= right || right > arr.length) {
        return;
    }
    var pivot = arr[left];
    var i = left;
    var j = right;
    while (i !== j) {
        while (arr[j] >= pivot && j > i) {
            j--;
        }
        while (arr[i] <= pivot && j > i) {
            i++;
        }
        if (j > i) {
            var temp = arr[j];
            arr[j] = arr[i];
            arr[i] = temp;
        }
    }
    arr[left] = arr[i];
    arr[i] = pivot;
    quickSort(left, i - 1, arr);
    quickSort(i + 1, right, arr);
}
```

参考资料：
- [坐在马桶上看算法：快速排序](http://developer.51cto.com/art/201403/430986.htm)

## 归并排序
归并排序的核心思想就是分治。这种思想方法可以提高算法的效率，在很多地方有用到，比如二分查找等。

```js
function sort(arr) {
    const n = arr.length
    // 公用一个临时空间，可以减少时间复杂度
    const temp = new Array(n)
    mergeSort(arr, temp, 0, n - 1)
}

function mergeSort(arr, temp, l, r) {
    if (l >= r) {
        return
    }
    const mid = l + Math.floor((r - l) / 2)
    mergeSort(arr, temp, l, mid)
    mergeSort(arr, temp, mid + 1, r)
    // 这一步可以减少很多不必要的操作
    if (arr[mid] <= arr[mid + 1]) {
        return;
    }
    merge(arr, temp, l, mid, r)
}

function merge(arr, temp, l, mid, r) {
    let lp = l, rp = mid + 1, k = l
    while (lp <= mid && rp <= r) {
        if (arr[lp] > arr[rp]) {
            temp[k++] = arr[rp++]
        } else {
            temp[k++] = arr[lp++]
        }
    }
    while (lp <= mid) {
        temp[k++] = arr[lp++]
    }
    while (rp <= r) {
        temp[k++] = arr[rp++]
    }
    for (let i = l; i <= r; i++) {
        arr[i] = temp[i]
    }
}
```

参考资料：
- [图解排序算法(四)之归并排序](https://www.cnblogs.com/chengxiao/p/6194356.html)
