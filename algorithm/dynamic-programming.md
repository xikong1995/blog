# 理论回顾

提起动态规划（dynamic programming），很多程序员是这种状态......

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200512001555505.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3pob3VsZWkxOTk1,size_16,color_FFFFFF,t_70)

很多程序员压根就没听过动态规划，即使听过也觉得很神秘，莫名其妙就高大尚了。

动态规划比较适合用来求解最优问题，比如求最大值、最小值等等。它可以非常显著地降低时间复杂度，提高代码的执行效率。不过，它也是出了名的难学。

**它的主要学习难点跟递归类似，那就是，求解问题的过程不太符合人类常规的思维方式。** 

对于新手来说，要想入门确实不容易。不过，等你掌握了之后，你会发现，实际上并没有想象中那么难。

> 博主认为：动态规划的思想简单来说就是把递归的问题转化为递推的问题，把需要递归的算法，转化为不需要递归的算法，即用空间去存储前一步的结果，供后面使用。其实动态规划算一种空间换时间的算法。

动态规划有很多理论性的东西，这里博主不多说，因为那些在你没有接触过动态规划问题前，看了也是白看，很难有一个感性的认识，反而会让你的大脑填入一堆浆糊。

# 真题演练

## 斐波那契数列
相信大家在数学课上都看过斐波那契数列，记得高中很多这种找规律题，数感比较好的人应该可以很快找出来。

`1，1，2，3，5，8，13， ... `

**其实很简单，就是第三个数等于前两个数之和。**

如果要求第30个数的值是多少，我们用程序怎么求呢？

我相信很多人第一时间就可以写出递归算法。

```javascript
function fibonacci(n) {
    if (n === 1 || n === 2) {
        return 1
    }
    return fibonacci(n - 1) + fibonacci(n - 2)
}
fibonacci(30)
```

刚刚我们说求第30个，那现在要求给出第100数的值。很多人心中肯定不屑，那还不简单直接运行`fibonacci(100)`不就完了吗？答案并非如此，大家可以在计算机中运行试试。

很多人在输入100后，发现自己的电脑没有反应，以为卡死了。其实那是正常情况，电脑还在计算中，并非死机了。

为什么会这样呢？因为递归会形成很多堆栈，这些堆栈在后一步运行完前会一直保留着，不会释放。但是一般计算机的执行引擎会有堆栈限制，超过最大值会报错，程序直接退出。

我们再来看看这道题，仔细观察，我们会看到很多结果被重复计算了。比如我们计算第5位，会先计算第4位和第3位，而计算第4位，会先计算第3位和第2位。这里第3位就被重复计算了。既然发现了这个问题，我们先来解决它。

**我们可以创建一个数组，来保存已经被计算过的值。**

```javascript
function action(n) {
    const memory = new Array(n + 1)
    return fibonacci(n, memory)
}
function fibonacci(n, memory) {
    if (n === 1 || n === 2) {
        return 1
    }
    if (memory[n] === undefined) {
        memory[n] = fibonacci(n - 1, memory) + fibonacci(n - 2, memory)
    }
    return memory[n]
}
action(100)
```

改造后，我们再次运行，会发现结果一下子就出来了，如丝般柔滑。这种方式被称之为**记忆化搜索**。

那还有没有优化空间呢？答案当然是有，递归会产生大量的堆栈，并且得不到释放。虽然有一种尾递归优化的手段，但是并非所有的递归都可以。我们可以思考下，怎么样不使用递归去求解。

如果之前没有思考过这样的问题，其实也不是那么容易就能想到的，这里直接给出代码供大家参考。

```javascript
function fibonacci(n) {
    if (n === 1 || n === 2) {
        return 1
    }
    const dp = new Array(n + 1)
    dp[1] = 1
    dp[2] = 1
    for (let i = 3; i <= n; i++) {
        dp[i] = dp[i - 1] + dp[i - 2]
    }
    return dp[n]
}
fibonacci(100)
```

不知道大家有没有发现一点点熟悉的味道。其实代码和递归很相似，只不过一个从自上而下，一个自下而上。这种方式称之为**递推**，和记忆化搜索类似，需要借助一个辅助空间。

看到这里，可能已经有一些同学忘记了我们本篇文章的主题——动态规划。其实，上面的最后一种解法就是动态规划的解法，是不是很简单。不过不要着急，动态规划的大门才刚刚在你眼前开启，连一只脚都还没迈进去。

## 小偷一代
我们来看一个系列题，打家劫舍，很有意思哦！

### 题目

你是一个专业的小偷，计划偷窃沿街的房屋。每间房内都藏有一定的现金，影响你偷窃的唯一制约因素就是相邻的房屋装有相互连通的防盗系统，如果两间相邻的房屋在同一晚上被小偷闯入，系统会自动报警。

给定一个代表每个房屋存放金额的非负整数数组，计算你在不触动警报装置的情况下，能够偷窃到的最高金额。

示例：

```
输入: [1,2,3,1]
输出: 4
解释: 偷窃 1 号房屋 (金额 = 1) ，然后偷窃 3 号房屋 (金额 = 3)。
     偷窃到的最高金额 = 1 + 3 = 4 。
```

```
输入: [2,7,9,3,1]
输出: 12
解释: 偷窃 1 号房屋 (金额 = 2), 偷窃 3 号房屋 (金额 = 9)，接着偷窃 5 号房屋 (金额 = 1)。
     偷窃到的最高金额 = 2 + 9 + 1 = 12 。
```

> 建议先自己思考，如果没有思路或者有了答案，都可以继续往下看。

### 解答

无需多说，我们这题肯定是用动态规划来解。但是新手一般毫无头绪，不知道从什么地方入手。我们可以这样思考，如果小偷从第一间房屋开始偷，并且偷到第`n - 1`间时，它偷的总金额的最大值为`dp[n - 2]`。那它偷到第`n`间时，它偷的总金额最大是多少呢？

依据条件**两间相邻的房屋不能同时偷**，我们不难得出，`dp[n - 1] = Math.max(nums[n - 1] + dp[n - 3], dp[n - 2])`，**这个表达式在动态规划中称之为状态转移方程**。这样，我们可以写出如下代码：

```js
var rob = function(nums) {
    const len = nums.length
    if (len === 0) return 0
    if (len === 1) return nums[0]
    const dp = new Array(len)
    dp[0] = nums[0]
    dp[1] = Math.max(nums[0], nums[1])
    for (let i = 2; i < len; i++) {
        dp[i] = Math.max(nums[i] + dp[i - 2], dp[i - 1])
    }
    return dp[len - 1]
};
```

这里只要我们找到状态转移方程，其实就很好解决了。这题不难，算是开胃菜，接着我们再来看看小偷二代。

## 小偷二代

### 题目

你是一个专业的小偷，计划偷窃沿街的房屋，每间房内都藏有一定的现金。这个地方所有的房屋都围成一圈，这意味着第一个房屋和最后一个房屋是紧挨着的。同时，相邻的房屋装有相互连通的防盗系统，如果两间相邻的房屋在同一晚上被小偷闯入，系统会自动报警。

给定一个代表每个房屋存放金额的非负整数数组，计算你在不触动警报装置的情况下，能够偷窃到的最高金额。

示例：

```
输入: [2,3,2]
输出: 3
解释: 你不能先偷窃 1 号房屋（金额 = 2），然后偷窃 3 号房屋（金额 = 2）, 因为他们是相邻的。
```

```
输入: [1,2,3,1]
输出: 4
解释: 你可以先偷窃 1 号房屋（金额 = 1），然后偷窃 3 号房屋（金额 = 3）。
     偷窃到的最高金额 = 1 + 3 = 4 。
```

### 解答

老实说，这道题很多人第一次看都没有思路。看似和第一题一样，但是多了一个环，这真让人头大。其实题目解决起来不难，关键是思路。

我们的目的是把所有房屋都考虑进去，但是目前有个环导致我们很难下手。我们可以一分为二，先求出`1 ~ (n-1)`区间的能偷的最大金额，再求出`2 ~ n`区间的最大金额。这样我们既避免了环的问题，也可以覆盖所有的区间。

```javascript
var rob = function(nums) {
    const len = nums.length
    if (len === 0) return 0
    if (len === 1) return nums[0]
    
    const dp1 = new Array(len) // 搜索 1 ~ (n-1)
    dp1[0] = nums[0]
    dp1[1] = Math.max(nums[0], nums[1])
    for (let i = 2; i < len - 1; i++) {
        dp1[i] = Math.max(nums[i] + dp1[i - 2], dp1[i - 1])
    }

    const dp2 = new Array(len) // 搜索 2 ~ n
    dp2[1] = nums[1]
    dp2[2] = Math.max(nums[1], nums[2])
    for (let i = 3; i < len; i++) {
        dp2[i] = Math.max(nums[i] + dp2[i - 2], dp2[i - 1])
    }

    return Math.max(dp1[len - 2], dp2[len - 1])
};
```

## 小偷三代
小偷二代其实是动态规划与环的一个结合，接下来我们看看动态规划与树的结合。

### 题目

在上次打劫完一条街道之后和一圈房屋后，小偷又发现了一个新的可行窃的地区。这个地区只有一个入口，我们称之为“根”。 除了“根”之外，每栋房子有且只有一个“父“房子与之相连。一番侦察之后，聪明的小偷意识到“这个地方的所有房屋的排列类似于一棵二叉树”。 如果两个直接相连的房子在同一天晚上被打劫，房屋将自动报警。

计算在不触动警报的情况下，小偷一晚能够盗取的最高金额。

示例：

```
输入: [3,2,3,null,3,null,1]

     3
    / \
   2   3
    \   \ 
     3   1

输出: 7 
解释: 小偷一晚能够盗取的最高金额 = 3 + 3 + 1 = 7.
```

```
输入: [3,4,5,1,3,null,1]

     3
    / \
   4   5
  / \   \ 
 1   3   1

输出: 9
解释: 小偷一晚能够盗取的最高金额 = 4 + 5 = 9.
```

### 解答

这一题难度系数变大一点，二叉树虽然比较简单，但是和动态规划结合起来有点绕。从根结点出发，我们想一想，如果要求偷得的最大金额该怎么做？依据题中的条件，相连的房屋不能同时偷，那么我们可以得出答案。

目前有两种偷法：

1. 偷根节点 + 从左子树`子节点`出发偷得的最大值 + 从右子树`子节点`出发偷得的最大值
2. 偷从左子树出发偷得的最大值 + 偷从右子树出发偷得的最大值
3. 最后我们只要取其中最大值返回就行

> 这里需要注意，我们采用了递归的技巧。一般关于二叉树的题，大多使用递归来解，因为树是天生的递归结构。

```javascript
var rob = function(root) {
    if (root === null) return 0
    const leftChildrenMax = root.left !== null ? rob(root.left.left) + rob(root.left.right) : 0
    const rightChildrenMax = root.right !== null ? rob(root.right.left) + rob(root.right.right) : 0
    return Math.max(root.val + leftChildrenMax + rightChildrenMax, rob(root.left) + rob(root.right))
};
```

## 最长上升子序列(LIS)
最长上升子序列（Longest Increasing Subsequence）这题算是动态规划中的经典题，我们先来看看该题。

### 题目

给定一个无序的整数数组，找到其中最长上升子序列的长度。

示例：

```
输入: [10,9,2,5,3,7,101,18]
输出: 4 
解释: 最长的上升子序列是 [2,3,7,101]，它的长度是 4。
```

说明：

- 可能会有多种最长上升子序列的组合，你只需要输出对应的长度即可。
- 你算法的时间复杂度应该为 $O(n^2)$ 。

> 由于我们主要介绍动态规划，所以这里就不讨论其他算法了。

### 解答

这道题说的是子序列，没有说连续的，所以只要保证先后顺序，即使断开也算。假设我们知道了第 `i` 项前所有以各元素为结尾的序列的最长上升子序列，那么我们如何求以第 `i` 项为结尾的最长上升子序列呢？

只要得出这个答案，我们就找到了本题的状态转移方程。其实也不难，举个例子，看我们上面给出的示例。现在我们知道了以数值 3 为结尾的最长上升子序列为 `[2,3]` ，那以数值 7 为结尾的如何计算了。7 比 3 大，我们只要在 3 结尾的最大子序列上加 1 即可。

但是如果此时说这个值最大，是不一定了。7 前面不止还有很多子序列，我们需要比较其前面每一个元素结尾的最长上升子序列。

状态转移方程为：$dp[i]=max(dp[j])+1,其中0≤j<i且num[j]<num[i]$

我们可以结合代码来进一步看如何使用动态规划的思想。

```javascript
var lengthOfLIS = function(nums) {
	// 基本的空和空数组校验
    if (nums === null || nums.length === 0) {
        return 0
    }
    const len = nums.length, dp = new Array(len)
    let ansMax = 1
    dp[0] = 1
    for (let i = 1; i < len; i++) {
        let itemMax = 0
        for (let j = 0; j < i; j++) {
            if (nums[i] > nums[j]) {
                itemMax = Math.max(itemMax, dp[j])
            }
        }
        // 保存每一项为结尾的最长上升子序列个数
        dp[i] = itemMax + 1
        // 这一步不要，最后整个从 dp 数组中比较得出最大值也行
        ansMax = Math.max(dp[i], ansMax)
    }
    return ansMax
};
```

## 最大子序和
看懂上一题，估计做动态规划相关的题目就有感觉了。再来看一道简单的题。

### 题目

给定一个整数数组 nums ，找到一个具有最大和的连续子数组（子数组最少包含一个元素），返回其最大和。

示例：

```
输入: [-2,1,-3,4,-1,2,1,-5,4],
输出: 6
解释: 连续子数组 [4,-1,2,1] 的和最大，为 6。
```

### 解答

假设我们知道了包含第 k 项的最大和的连续子数组，那么我们可以很简单求出包含第 k + 1 项的最大和的连续子数组的值。

状态转移方程：$dp[k] = Math.max(dp[k - 1] + nums[k], nums[k])$

最终我们要求的是 dp 数组中的最大值。

```javascript
var maxSubArray = function(nums) {
    if (!nums || nums.length === 0) {
    	return 0
    }
    const len = nums.length, dp = new Array(len)
    let max = dp[0]
    for (let i = 1; i < len; i++) {
       	dp[i] = Math.max(dp[i - 1] + nums[i], nums[i])
		max = Math.max(dp[i], max)
    }
    return max
};
```

*这里我们还可以进一步优化空间复杂度，可以根据需要自行优化。*

## 乘积最大子数组
上一题，我们求的是最大和，这一题我们来看看最大积。

### 题目

给你一个整数数组 nums ，请你找出数组中乘积最大的连续子数组（该子数组中至少包含一个数字），并返回该子数组所对应的乘积。

示例：

```
输入: [2,3,-2,4]
输出: 6
解释: 子数组 [2,3] 有最大乘积 6。
```

```
输入: [-2,0,-1]
输出: 0
解释: 结果不能为 2, 因为 [-2,-1] 不是子数组。
```

### 解答

可能很多人和博主最开始一样，直接拿标准的动态规划模板套。但是最后发现不对头，因为负负得正。可能前面连续最小的，最后乘当前值会变成最大的。所以我们需要同时维护上一个最大值和上一个最小值。

```javascript
var maxProduct = function(nums) {
    if (!nums || nums.length === 0) {
    	return 0
    }
    const len = nums.length
    let max = nums[0], min = nums[0], ans = nums[0]
    for (let i = 1; i < len; i++) {
        const tmax = max, tmin = min
        min = Math.min(tmax * nums[i], tmin * nums[i], nums[i])
        max = Math.max(tmax * nums[i], tmin * nums[i], nums[i])
        ans = Math.max(ans, max)
    }
    return ans
};
```

看到这里，很多人可能觉得动态规划好无聊！

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200519232710336.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3pob3VsZWkxOTk1,size_16,color_FFFFFF,t_70)

确实，我们上面看到的都是一些数学问题。接下来的我们联系生活中的场景来看看动态规划的应用。什么场景呢？大家感兴趣的 money（钱）。

## 硬币

![在这里插入图片描述](https://img-blog.csdnimg.cn/2020051923314185.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3pob3VsZWkxOTk1,size_10,color_FFFFFF,t_70)

### 题目

给定数量不限的硬币，币值为25分、10分、5分和1分，编写代码计算n分有几种表示法。(结果可能会很大，你需要将结果模上1000000007)

示例：

```
 输入: n = 5
 输出：2
 解释: 有两种方式可以凑成总金额:
5=5
5=1+1+1+1+1
```

```
输入: n = 10
 输出：4
 解释: 有四种方式可以凑成总金额:
10=10
10=5+5
10=5+1+1+1+1+1
10=1+1+1+1+1+1+1+1+1+1
```

说明：

你可以假设：$0 <= n (总金额) <= 1000000$

### 解答

这里和前面几种不太一样，因为它是二维的，需要考虑两个维度，即硬币的类型和给出的总钱数（分）。这里博主画一个表格帮助大家理解。

首先，我们如果只用1分的硬币，那答案很简单。接着，如果我们只用1分和5分两种硬币，答案要复杂些，但是我们可以基于前面只用1分得出的结果来计算。依次类推，我们一直往下计算，最终可以得出包所有硬币的分法。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200520003901115.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3pob3VsZWkxOTk1,size_16,color_FFFFFF,t_70)

根据上面的表格，我们可以写出如下代码。

```javascript
var waysToChange = function(n) {
    const dp5 = new Array(n + 1)
    const dp10 = new Array(n + 1)
    const dp25 = new Array(n + 1)
    dp5[0] = 1
    dp10[0] = 1
    dp25[0] = 1
    for (let i = 1; i <= n; i++) {
        dp5[i] = i - 5 >= 0 ? dp5[i - 5] + 1 : 1
    }
    for (let i = 1; i <= n; i++) {
        dp10[i] = i - 10 >= 0 ? dp10[i - 10] + dp5[i] : dp5[i]
    }
    for (let i = 1; i <= n; i++) {
        dp25[i] = i - 25 >= 0 ? dp25[i - 25] + dp10[i] : dp10[i]
    }
    return dp25[n] % 1000000007
};
```

其实上面的代码的空间复杂度可以继续优化，通过分析，我们可以发现一旦进行下一种类型的硬币的计算，其实只需要依赖前一种硬币的结果，其他的可以覆盖掉。经过优化我们可以得出如下代码：

```javascript
var waysToChange = function(n) {
    const dp = new Array(n + 1)
    dp.fill(0)
    dp[0] = 1
    const coins = [1, 5, 10, 25]
    for (let i = 0; i < 4; i++) {
        for (let j = 1; j <= n; j++) {
            const sub = j - coins[i]
            if (sub >= 0) {
                dp[j] += dp[sub]
            }
        }
    }
    return dp[n] % 1000000007
};
```
## 零钱兑换

### 题目

给定不同面额的硬币 coins 和一个总金额 amount。编写一个函数来计算可以凑成总金额所需的最少的硬币个数。如果没有任何一种硬币组合能组成总金额，返回 -1。

示例：

```
输入: coins = [1, 2, 5], amount = 11
输出: 3 
解释: 11 = 5 + 5 + 1
```

```
输入: coins = [2], amount = 3
输出: -1
```

### 解答

如果对回溯法比较熟悉的人，可能第一感觉是使用回溯的思想，利用递归的技巧解题。但是这篇博文的主题是动态规划，所以大家可以思考如何利用动态规划的思想来求解。

其实这题和上面那道题很类似，但不同的是这题是一个求最优解的问题。我们先找到最优子结构，`F(S)：组成金额 S 所需的最少硬币数量`。若组成金额 S 最少的硬币数，最后一枚硬币的面值是 C，分析可得出状态转移方程，`F(S)=F(S−C)+1`。

我们这里只要比对每一个硬币，得出其中的最小值即可。

```javascript
var coinChange = function(coins, amount) {
    if (amount === 0) return 0
    let ans = Number.POSITIVE_INFINITY
    const dp = new Array(amount + 1)
    dp.fill(-1)
    dp[0] = 0
    for (let i = 1; i <= amount; i++) {
        for (let j = 0; j < coins.length; j++) {
            if (i - coins[j] < 0 || dp[i - coins[j]] === -1) {
                continue
            }
            dp[i] = dp[i] === -1 ? dp[i - coins[j]] + 1 : Math.min(dp[i - coins[j]] + 1, dp[i])
        }
    }
    return dp[amount]
};
```

# 总结

动态规划比较难的是找到状态的定义，然后分析得出状态转移方程。另一个必要重要的是重叠子问题，事实上在根据状态转移方程得出每个状态时，需要缓存这个状态，这样可以避免重复计算，也是动态规划的核心。

之前说过，动态规划适合求解最优解问题。这类问题加了一个最优子结构的概念，其实就是前面状态中符合提题意的一种状态，博主认为一种特殊情况。最优子结构（特殊的状态），找到后和普通动态规划问题一样，继续找到状态转移方程。

经过博文中的几道动态规划的题，可以让大家稍微明白动态规划的应用与解题思路。如果对动态规划特别感兴趣，可以点击下面的链接继续做题。

- [跳跃游戏](https://leetcode-cn.com/problems/jump-game/)
- [不同路径](https://leetcode-cn.com/problems/unique-paths/)
- [爬楼梯](https://leetcode-cn.com/problems/climbing-stairs/)
- [三角形最小路径和](https://leetcode-cn.com/problems/triangle/)
- [单词拆分](https://leetcode-cn.com/problems/word-break/)
- [完全平方数](https://leetcode-cn.com/problems/perfect-squares/)
- [整数拆分](https://leetcode-cn.com/problems/integer-break/)
- [分割等和子集](https://leetcode-cn.com/problems/partition-equal-subset-sum/)
- [目标和](https://leetcode-cn.com/problems/target-sum/)
- [按摩师](https://leetcode-cn.com/problems/the-masseuse-lcci/)
- [最低票价](https://leetcode-cn.com/problems/minimum-cost-for-tickets/)
- [最长公共子序列](https://leetcode-cn.com/problems/longest-common-subsequence/)
