# 理论回顾

## 二叉树简介
数据结构中有一种结构是树，不过一般我们常见的是树中的一种特殊类型——二叉树。二叉树简单来说就是每个节点最多有两个子节点。

如果每个节点都有两个子节点，那么我们称这种二叉树为**满二叉树**。

还有一种二叉树，其叶子节点都在最底下两层，最后一层叶子节点都靠左排列，并且除了最后一层，其他层的叶子节点都要达到最大，这种二叉树叫作**完全二叉树**。

![完全二叉树](https://img-blog.csdnimg.cn/20200706220410874.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3pob3VsZWkxOTk1,size_16,color_FFFFFF,t_70)

除了上面那些，这里还需要特别提到一种树，**二叉搜索树**。二叉搜索树要求，在树中的任意一个节点，其左子树中的每个节点的值，都要小于这个节点的值，而右子树节点的值都大于这个节点的值。

![二叉搜索树](https://img-blog.csdnimg.cn/20200706222959813.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3pob3VsZWkxOTk1,size_16,color_FFFFFF,t_70)

## 二叉树存储方式
二叉树的定义我们已经知道了，但是实际编程中我们如何去存储一个二叉树呢？主要有两种方式，**链式存储法**和**顺序存储法**。

### 链式存储法
这种方式简单，也非常常见，主要通过指针来连接不同的节点。

![链式存储法](https://img-blog.csdnimg.cn/20200706220953990.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3pob3VsZWkxOTk1,size_16,color_FFFFFF,t_70)

### 顺序存储法
这种存储方法最适合完全二叉树，它主要使用数组来进行存储。

![顺序存储法](https://img-blog.csdnimg.cn/20200706221049420.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3pob3VsZWkxOTk1,size_16,color_FFFFFF,t_70)

## 二叉树遍历
主要分为4种遍历方式：

1. 前序遍历：对于树中的任意节点来说，先打印这个节点，然后再打印它的左子树，最后打印它的右子树。
2. 中序遍历：对于树中的任意节点来说，先打印它的左子树，然后再打印它本身，最后打印它的右子树。
3. 后序遍历：对于树中的任意节点来说，先打印它的左子树，然后再打印它的右子树，最后打印这个节点本身。
4. 按层遍历：从第一层开始，从左到右遍历整棵二叉树。

> 注意：前、中、后遍历都针对根节点来说的。如根节点在前，那就是前序。

# 真题演练

温习一下概念之后，我们需要做的就是实战。据博主多年的经验，概念的东西只是简单的背诵记忆是没有用的，必须要应用，这样才能有深刻的理解。话不多说，我们先来一道开胃菜。

## 二叉树的最大深度

### 题目

给定一个二叉树，找出其最大深度。

二叉树的深度为根节点到最远叶子节点的最长路径上的节点数。

说明: 叶子节点是指没有子节点的节点。

示例：

给定二叉树 [3,9,20,null,null,15,7]，

```bash
    3
   / \
  9  20
    /  \
   15   7
```

返回它的最大深度 3 。

### 解答

这道题是求二叉树的最大深度，也就是二叉树的最大层数。做法很简单从根结点一直加到叶子节点，然后比较所有的个数，求出最大的。

但是怎样编程呢？这里需要告诉大家一个诀窍，凡是和二叉树相关的算法题，我们都可以从递归的思路分析。因为二叉树是天然的递归结构，所以采用递归可以解决很多问题。

```javascript
/**
 * Definition for a binary tree node.
 * function TreeNode(val) {
 *     this.val = val;
 *     this.left = this.right = null;
 * }
 */
/**
 * @param {TreeNode} root
 * @return {number}
 */
var maxDepth = function(root) {
    if (root === null) {
        return 0
    }
    return 1 + Math.max(maxDepth(root.left), maxDepth(root.right))
};
```

**举一反三：**

- [ 二叉树的最小深度](https://leetcode-cn.com/problems/minimum-depth-of-binary-tree/)

## 求根到叶子节点数字之和
有了前面的热身，可能有些人觉得不过瘾。接下来，我们一道中等难度的题。

### 题目

给定一个二叉树，它的每个结点都存放一个 0-9 的数字，每条从根到叶子节点的路径都代表一个数字。

例如，从根到叶子节点路径 1->2->3 代表数字 123。

计算从根到叶子节点生成的所有数字之和。

说明: 叶子节点是指没有子节点的节点。

示例 1:

```bash
输入: [1,2,3]
    1
   / \
  2   3
输出: 25
解释:
从根到叶子节点路径 1->2 代表数字 12.
从根到叶子节点路径 1->3 代表数字 13.
因此，数字总和 = 12 + 13 = 25.
```

示例 2:
```bash
输入: [4,9,0,5,1]
    4
   / \
  9   0
 / \
5   1
输出: 1026
解释:
从根到叶子节点路径 4->9->5 代表数字 495.
从根到叶子节点路径 4->9->1 代表数字 491.
从根到叶子节点路径 4->0 代表数字 40.
因此，数字总和 = 495 + 491 + 40 = 1026.
```

### 解答

这题咋一看有点复杂，不过不要急。仔细阅读题目后，我们能找出线索。只要我们把每一条路径找到，然后把它们的值加起来就行。

问题就转化成找到每一条路径。如何去做呢？上一题我们提到了，二叉树相关的题目可以从递归的思路去分析。这里我们采用递归的深度优先遍历（dfs），就可以轻松解决。

```javascript
/**
 * Definition for a binary tree node.
 * function TreeNode(val) {
 *     this.val = val;
 *     this.left = this.right = null;
 * }
 */
/**
 * @param {TreeNode} root
 * @return {number}
 */
var sumNumbers = function(root) {
    if (root === null) {
        return 0
    } 
    const nums = []
    dfs(root, 0, nums)
    return nums.reduce((total, value, index) => {
        return total + value
    }, 0)
};

const dfs = (root, total, nums) => {
    if (root.left === null && root.right === null) {
        nums.push(total * 10 + root.val)
        return
    }
    if (root.left !== null) {
        dfs(root.left, total * 10 + root.val, nums)
    }
    if (root.right !== null) {
        dfs(root.right, total * 10 + root.val, nums)
    }
}
```

**举一反三：**

- [二叉树的所有路径](https://leetcode-cn.com/problems/binary-tree-paths/)
- [左叶子之和](https://leetcode-cn.com/problems/sum-of-left-leaves/)

## 翻转二叉树
这道题有个故事，有位开源软件的大佬 Max Howell 去 Google 面试。在白板上，他没能写出这道题，所以被 Google 拒绝了。

### 题目
翻转一棵二叉树。

示例：

输入：

```bash
     4
   /   \
  2     7
 / \   / \
1   3 6   9
```

输出：

```bash
     4
   /   \
  7     2
 / \   / \
9   6 3   1
```

### 解答
这道题虽然大佬没能当场写出来，但这并不能说明大佬的水平差。这道题就是把左右子树交换，难点在编程实现。如果你没有思路，不妨还是按照我们前面说的，采用递归的思想。

```javascript
/**
 * Definition for a binary tree node.
 * function TreeNode(val) {
 *     this.val = val;
 *     this.left = this.right = null;
 * }
 */
/**
 * @param {TreeNode} root
 * @return {TreeNode}
 */
var invertTree = function(root) {
    if (root === null || (root.left === null && root.right == null)) {
        return root
    }
    if (root.left === null) {
        root.left = root.right
        // 特别注意这一步
        root.right = null
    } else if (root.right === null) {
        root.right = root.left
        // 特别注意这一步
        root.left = null
    } else {
        const tree = root.left
        root.left = root.right
        root.right = tree
    }
    invertTree(root.left)
    invertTree(root.right)

    return root
};
```

**举一反三：**

- [相同的树](https://leetcode-cn.com/problems/same-tree/)
- [对称二叉树](https://leetcode-cn.com/problems/symmetric-tree/)

# 总结
在实际工作中，二叉树几乎没有用到过，毕竟业务里基本不涉及复杂的数据处理。如一定要联系一个实际的例子，博主能想到的是间接的用到过二叉树，而且是二叉树中非常复杂的一种红黑树。我们大概都使用过哈希表，它的底层实现中就有用到红黑树。不过，不同的语言提供的sdk的实现不一样，也不能说一定会用到。
