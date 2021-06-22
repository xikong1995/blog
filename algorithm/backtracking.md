# 理论回顾
回溯法（Backtrack）其实是基于递归来实现的。

但是它的思考逻辑很有意思，和走迷宫一样。比如我们走到一个分叉口，我们不知道哪一个路口是正确的，但是我们可以先随便选择一个路口。如果最后走不通，我们可以原地返回，在之前的分叉口重新抉择。

正是因为这种回溯的思考方式，所以这种算法称之为回溯法。

笼统地讲，回溯算法很多时候都应用在“搜索”这类问题上。不过这里说的搜索，并不是狭义的指我们前面讲过的图的搜索算法，而是在一组可能的解中，搜索满足期望的解。

# 真题演练

## [组合总和](https://leetcode-cn.com/problems/combination-sum)

### 题目

给定一个无重复元素的数组 candidates 和一个目标数 target ，找出 candidates 中所有可以使数字和为 target 的组合。

candidates 中的数字可以无限制重复被选取。

**说明：**

- 所有数字（包括 target）都是正整数。
- 解集不能包含重复的组合。 

示例 1:
```
输入: candidates = [2,3,6,7], target = 7,
所求解集为:
[
  [7],
  [2,2,3]
]
```

示例 2:
```
输入: candidates = [2,3,5], target = 8,
所求解集为:
[
  [2,2,2,2],
  [2,3,3],
  [3,5]
]
```

### 解答

这一题的解题思路很简单，我们直接暴力枚举即可。其实我们开头说到了，枚举是回溯法的体现，回溯法的关键之处在于“回”，就是什么时候条件终止，回头在找。话不多说，直接上代码。

```javascript
/**
 * @param {number[]} candidates
 * @param {number} target
 * @return {number[][]}
 */
var combinationSum = function(candidates, target) {
    const ans = [], list = []
    backtrack(candidates, target, 0, list, ans)
    return ans
};

function backtrack(candidates, target, start, list, ans) {
    const total = list.reduce((total, a) => {
        total += a
        return total
    }, 0)
    if (total >= target) {
        if (total === target) {
            // 因为是引用类型，做一次浅拷贝操作
            ans.push(list.slice(0))
        }
        // 这里开始回溯
        return
    }
    const n = candidates.length
    for (let i = start; i < n; i++) {
        list.push(candidates[i])
        backtrack(candidates, target, i, list, ans)
        list.pop()
    }
}
```

## [组合总和 II](https://leetcode-cn.com/problems/combination-sum-ii)

上面一题虽然简单，但是涵盖了回溯法的精髓，可以说是一种模板，遇到类似的题可以根据这个模板来套。我们再看一道题，与上面类似，但是修改了一些条件。

### 题目

给定一个数组 candidates 和一个目标数 target ，找出 candidates 中所有可以使数字和为 target 的组合。

candidates 中的每个数字在每个组合中只能使用一次。

**说明：**

- 所有数字（包括目标数）都是正整数。
- 解集不能包含重复的组合。 

示例 1:

```
输入: candidates = [10,1,2,7,6,1,5], target = 8,
所求解集为:
[
  [1, 7],
  [1, 2, 5],
  [2, 6],
  [1, 1, 6]
]
```

示例 2:

```
输入: candidates = [2,5,2,1,2], target = 5,
所求解集为:
[
  [1,2,2],
  [5]
]
```

### 解答

这一题给定的数组中可能包含重复元素，其次数组中的元素每一个只能使用一次。

```javascript
/**
 * @param {number[]} candidates
 * @param {number} target
 * @return {number[][]}
 */
var combinationSum2 = function(candidates, target) {
    const ans = [], list = []
    let total = 0
    // 这里排序主要是为了和后面去重和搜索剪枝配合
    candidates.sort((a, b) => a - b)
    backtrack(candidates, target, 0, list, ans, total)
    return ans
};

function backtrack(candidates, target, start, list, ans, total) {
    if (total >= target) {
        if (total === target) {
            // 因为是引用类型，做一次浅拷贝操作
            ans.push(list.slice(0))
        }
        return
    }
    // 这里可以使用参数进行传递，读者可以自行优化
    const n = candidates.length
    for (let i = start; i < n; i++) {
        // 模板式去重，这里注意要大于 start，而不是 0
        if (i > start && candidates[i] === candidates[i - 1]) continue
        // 搜索剪枝，这一步优化可以大幅提高效率，leetcode 上击败 97.79%
        if (total + candidates[i] > target) break
        list.push(candidates[i])
        total += candidates[i]
        backtrack(candidates, target, i + 1, list, ans, total)
        list.pop()
        total -= candidates[i]
    }
}
```

> 还有一个 [组合总和 III](https://leetcode-cn.com/problems/combination-sum-iii/) 很有意思，限于篇幅，这里不在介绍，方法都是回溯的思想。

## [全排列](https://leetcode-cn.com/problems/permutations/)
上面两道题是关于组合的，组合和排列的区别是前者无关顺序，而后者需要注意顺序。

### 题目

给定一个 **没有重复** 数字的序列，返回其所有可能的全排列。

**示例：**

```
输入: [1,2,3]
输出:
[
  [1,2,3],
  [1,3,2],
  [2,1,3],
  [2,3,1],
  [3,1,2],
  [3,2,1]
]
```

### 解答

其实排列问题最大的不同是顺序，同样两个数，不同的顺序其表示的答案也是不同的。

```javascript
/**
 * @param {number[]} nums
 * @return {number[][]}
 */
var permute = function(nums) {
    const list = [], ans = []
    const n = nums.length
    const mark = new Array(n)
    // 这一步可以不做，默认为 undefined，和 false 作用类似
    mark.fill(false)
    backtrack(nums, n, mark, list, ans)
    return ans
};

function backtrack(nums, n, mark, list, ans) {
    if (list.length === n) {
        // ES6 浅拷贝
        ans.push([...list])
        return
    }
    for (let i = 0; i < n; i++) {
        // 标记哪一个数被使用过。如果第一次不会，记住就好
        if (mark[i]) continue
        list.push(nums[i])
        mark[i] = true
        backtrack(nums, n, mark, list, ans)
        list.pop()
        mark[i] = false
    }
}
```

## [全排列 II](https://leetcode-cn.com/problems/permutations-ii/)

### 题目

给定一个 **可包含重复数字** 的序列，返回所有不重复的全排列。

**示例：**

```
输入: [1,1,2]
输出:
[
  [1,1,2],
  [1,2,1],
  [2,1,1]
]
```

### 解答

这题有两个比较大的变化，第一**数组中包含重复数组**，第二**求全排列，意思每组结果包含所有元素**。

```javascript
/**
 * @param {number[]} nums
 * @return {number[][]}
 */
var permuteUnique = function(nums) {
    const list = [], ans = []
    const n = nums.length
    const mark = new Array(n)
    mark.fill(false)
    // 注意，这里需要排序，和后面模板式去重配合
    nums.sort((a, b) => a - b)
    backtrack(nums, n, mark, list, ans)
    return ans
};

function backtrack(nums, n, mark, list, ans) {
    if (list.length === n) {
        ans.push(list.slice(0))
        return
    }
    for (let i = 0; i < n; i++) {
        // 模板式去重
        if (i > 0 && !mark[i - 1] && nums[i] === nums[i - 1]) continue
        if (mark[i]) continue
        list.push(nums[i])
        mark[i] = true
        backtrack(nums, n, mark, list, ans)
        list.pop()
        mark[i] = false
    }
}
```
