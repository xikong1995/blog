# 理论回顾

链表和数组有点类似，都是线性表的一种，但是它们又有很大的不同。数组需要一块连续的内存空间来存储，而链表恰恰相反，它并不需要一块连续的内存空间，它通过“指针”将一组零散的内存块串联起来使用。

为了方便直观回顾链表相关内容，博主画了一张思维脑图，包含链表的基本结构、操作以及常见的练习题。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210206231651641.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3pob3VsZWkxOTk1,size_16,color_FFFFFF,t_70#pic_center)

# 真题演练

## [合并两个有序链表](https://leetcode-cn.com/problems/merge-two-sorted-lists/)

### 题目
将两个升序链表合并为一个新的 升序 链表并返回。新链表是通过拼接给定的两个链表的所有节点组成的。 

### 解答
如果有了解归并排序的读者，相信对合并两个有序序列不陌生。虽然链表和数组有一些区别，但是合并的原理都是一样。首先要定义一个新的序列，然后比较原先的两个序列，不断把结果加到新的序列中去。

```javascript
var mergeTwoLists = function(l1, l2) {
    let dummyHead = {}
        l = dummyHead
    while (l1 && l2) {
        if (l1.val <= l2.val) {
            l.next = l1
            l1 = l1.next
        } else {
            l.next = l2
            l2 = l2.next
        }
        l = l.next
    }
    while (l1) {
        l.next = l1
        l1 = l1.next
        l = l.next
    }
    while (l2) {
        l.next = l2
        l2 = l2.next
        l = l.next
    }
    return dummyHead.next
};
```

## [链表的中间结点](https://leetcode-cn.com/problems/middle-of-the-linked-list/)

### 题目
给定一个头结点为 head 的非空单链表，返回链表的中间结点。

如果有两个中间结点，则返回第二个中间结点。

示例1:

```bash
输入：[1,2,3,4,5]
输出：此列表中的结点 3 (序列化形式：[3,4,5])
返回的结点值为 3 。 (测评系统对该结点序列化表述是 [3,4,5])。
注意，我们返回了一个 ListNode 类型的对象 ans，这样：
ans.val = 3, ans.next.val = 4, ans.next.next.val = 5, 以及 ans.next.next.next = NULL.
```

示例2:

```bash
输入：[1,2,3,4,5,6]
输出：此列表中的结点 4 (序列化形式：[4,5,6])
由于该列表有两个中间结点，值分别为 3 和 4，我们返回第二个结点。
```

提示：

- 给定链表的结点数介于 1 和 100 之间。

### 解答
找中间结点应该是链表中最经典的题目之一了，没有太大的难度，只需要掌握一个技巧——快慢指针即可。

```javascript
var middleNode = function(head) {
    let fast = head
    let slow = head
    while (fast && fast.next) {
    	// 慢指针，每次走一步
        slow = slow.next
        // 快指针，每次走两步
        fast = fast.next.next
    }
    return slow
};
```

## [删除链表的倒数第 N 个结点](https://leetcode-cn.com/problems/remove-nth-node-from-end-of-list/)

### 题目
给你一个链表，删除链表的倒数第 n 个结点，并且返回链表的头结点。

进阶：你能尝试使用一趟扫描实现吗？

### 解答
这题的**关键点就是找出倒数第 n 个结点**。和上一题的思路是类似的，使用快慢指针技巧。快指针先走 n 部，然后慢指针开始走。当快指针达到链表结尾时，慢指针所在的位置就是倒数第 n 个结点。

```javascript
var removeNthFromEnd = function(head, n) {
	// 定义一个哑结点，避免头结点的特殊处理
    let dummyHead = {
        next: head
    }
    // 这里定义的是慢结点的前驱结点，因为后面要进行删除操作
    let slowPrev = dummyHead, 
        fast = dummyHead,
        index = 0
    while (fast.next) {
        ++index
        fast = fast.next
        if (index > n) {
            slowPrev = slowPrev.next
        }
    }
    slowPrev.next = slowPrev.next.next
    return dummyHead.next
};
```

## [反转链表](https://leetcode-cn.com/problems/reverse-linked-list/)

### 题目
反转一个单链表。

**示例**

```bash
输入: 1->2->3->4->5->NULL
输出: 5->4->3->2->1->NULL
```

**进阶:** 

你可以迭代或递归地反转链表。你能否用两种方法解决这道题？

### 解答
如果从来没有做过链表相关的题目，那么做这道题还是有一定难度，尽管这道题在力扣上标为简单。

如果脑中没有清晰的思路，博主的建议是画图。链表反转的关键就是链表指针的指向问题，我们可以在图上把这种指向关系画出来，这样我们写起代码会简单很多。

这题迭代法的思路相对简单些，所以我们先尝试这种方法。

```javascript
var reverseList = function(head) {
    let prev = null
    let curr = head
    while (curr) {
        const next = curr.next
        curr.next = prev
        prev = curr
        curr = next
    }
    return prev
};
```

递归的思路有点复杂，需要仔细分析。

若从节点 $n_{k+1}$ 到 $n_{m}$ 已经被反转，而我们正处于 $n_{k}$。

```bash
n1 → … → nk−1 → nk → nk+1 ← … ← nm
```

我们希望 $n_{k+1}$  的下一个节点指向 $n_{k}$ 。
 
 所以，$n_k.\textit{next}.\textit{next} = n_k$ 。
 
```javascript
var reverseList = function(head) {
    if (head === null || head.next === null) {
        return head
    }
    const newHead = reverseList(head.next)
    head.next.next = head
    head.next = null
    return newHead
};
```

## [反转链表 II](https://leetcode-cn.com/problems/reverse-linked-list-ii/)

### 题目
反转从位置 m 到 n 的链表。请使用一趟扫描完成反转。

**说明:**

1 ≤ m ≤ n ≤ 链表长度。

**示例:**

```bash
输入: 1->2->3->4->5->NULL, m = 2, n = 4
输出: 1->4->3->2->5->NULL
```

### 解答
这道题比上一道题要难一些，标记为中等。

我们其实可以把链表分成两刀三段，第一刀在 m 结点上，m 当前的结点位置用 mCurr 表示，而 m 结点前面一个结点位置用 mPrev 表示。

```javascript
var reverseBetween = function(head, m, n) {
	// 定义一个哑结点，便于统一遍历链表以及返回最后的头结点
    let dummyHead = {
        next: head
    }
    let index = 1
    let prev = dummyHead, curr = head, mPrev = null, mCurr = null
    // 遍历链表，找到 m 结点和其前一个结点
    while (index <= m) {
        if (index === m) {
            mPrev = prev
            mCurr = curr
        }
        prev = curr
        curr = curr.next
        index++
    }
    // 如果 n 和 m 相等，那么下面这个 while 循环直接跳过
    while (index <= n) {
    	// 模板式反转写法
        const next = curr.next
        curr.next = prev
        prev = curr
        curr = next
        index++
    }
    // 最关键的一步，把三段变成一段
    mPrev.next = prev
    mCurr.next = curr
    
    return dummyHead.next
};
```

## [环形链表 II](https://leetcode-cn.com/problems/linked-list-cycle-ii/)

### 题目
给定一个链表，返回链表开始入环的第一个节点。 如果链表无环，则返回 null。

为了表示给定链表中的环，我们使用整数 pos 来表示链表尾连接到链表中的位置（索引从 0 开始）。 如果 pos 是 -1，则在该链表中没有环。注意，pos 仅仅是用于标识环的情况，并不会作为参数传递到函数中。

### 解答
判断链表是否有环比较简单，使用快慢指针的技巧即可。那如何找到入环的第一个节点呢？其实这是一个数学推理问题，把这个规律找到，那么问题就迎刃而解。

我们假设慢指针走过的路程为 a，快指针走过的路程为 b，那么可知 $b = 2a$。

设快慢指针在环外走过的路程为 c，环中相遇前慢指针走过路程为 d，快指针走过路程为 e，快指针走过的路程等于 2d 加上慢指针没有走过的路程 f。则 $2c + 2d = c + e = c + 2d + f$，即 $c = f$。（`这里没有配图，所以看起来很难理解，之后有时间会画张图补上，目前直接看代码或许更易理解`）

这里可知当快慢指针相遇时，再从起点和相遇点分别出发两个点，这两个点相遇的地方就是入环的第一个节点。

```javascript
var detectCycle = function(head) {
    let fast = head
    let slow = head
    while (fast && fast.next) {
        slow = slow.next
        fast = fast.next.next
        if (fast === slow) {
            fast = head
            // 快慢指针相遇后，让快指针重新从起点出发
            // 当再次与慢指针相遇，相遇点即为入环第一个节点
            while (fast !== slow) {
                fast = fast.next
                slow = slow.next
            }
            return slow
        }
    }
    return null
};
```

# 总结
老实说，链表的题目不复杂，往往就是几行代码，但是想要写出一个没有 bug 的程序还是比较困难的。不过好在真实工作中，并不需要面对太对这种指针指来指去的问题。也就平时抽空练习下，锻炼下大脑。
