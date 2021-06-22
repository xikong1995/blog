# 理论回顾

## 哈希思想
哈希表（Hash Table）用的是数组支持按照下标随机访问数据的特性，所以哈希表其实就是数组的一种扩展，由数组演化而来。可以说，如果没有数组，就没有哈希表。

哈希表有两个关键点需要了解，一个是哈希函数，另一个是哈希冲突。这也是构造哈希表的两个关键要素。

## 哈希函数
哈希函数，顾名思义，它是一个函数。我们可以把它定义成 hash(key)，其中 key 表示元素的键值，hash(key) 的值表示经过哈希函数计算得到的哈希值。

## 哈希冲突
再好的哈希函数也无法避免哈希冲突，我们常用的哈希冲突解决方法有两类，**开放寻址法**（open addressing）和**链表法**（chaining）。

> 理论知识就简单回顾到这。如果读者从来没有了解过哈希表，那建议找一篇理论文章读一读，本文这里仅仅带大家回顾一些关键概念点。

# 真题演练

## [有效的字母异位词](https://leetcode-cn.com/problems/valid-anagram/)

### 题目
给定两个字符串 s 和 t ，编写一个函数来判断 t 是否是 s 的字母异位词。

**示例：**

```bash
输入: s = "anagram", t = "nagaram"
输出: true
```

```bash
输入: s = "rat", t = "car"
输出: false
```
### 解答
本题难度为简单，有多种解法。这里主要介绍利用哈希表求解的方法。

**思路：** 

对 s 和 t 个进行一次遍历，第一次统计每个字母出现的个数。第二次如果出现存在哈希表的字母，那么其个数减一。最后统计哈希表中每个 key 的个数，如果都为 0，那么两者为异位词，否则，不是。

```javascript
var isAnagram = function(s, t) {
    if (s.length !== t.length) {
        return false
    }
    const hashmap = new Map()
    for (let i = 0; i < s.length; i++) {
        if (!hashmap.has(s[i])) {
            hashmap.set(s[i], 0)
        }
        hashmap.set(s[i], hashmap.get(s[i]) + 1)
    }
    for (let i = 0; i < t.length; i++) {
        if (!hashmap.has(t[i])) {
            return false
        }
        hashmap.set(t[i], hashmap.get(t[i]) - 1)
    }
    for (let key of hashmap.keys()) {
        if (hashmap.get(key) !== 0) {
            return false
        }
    }
    return true
};
```

## [字母异位词分组](https://leetcode-cn.com/problems/group-anagrams/)

### 题目
给定一个字符串数组，将字母异位词组合在一起。字母异位词指字母相同，但排列不同的字符串。

```bash
输入: ["eat", "tea", "tan", "ate", "nat", "bat"]
输出:
[
  ["ate","eat","tea"],
  ["nat","tan"],
  ["bat"]
]
```

### 解答
这题其实比较简单，但是却标为中等难度。和上题一样，也是使用哈希表。在代码中，博主没有显示声明哈希表，而是使用一个 js 对象表示，道理其实都一样。

```javascript
var groupAnagrams = function(strs) {
    const map = {}
    strs.forEach(str => {
        const sortStr = str.split('').sort().join('')
        if (map[sortStr]) {
            map[sortStr].push(str)
        } else {
            map[sortStr] = [str]
        }
    })
    const res = []
    Object.keys(map).forEach(key => {
        res.push(map[key])
    })
    return res
};
```

## [两数之和](https://leetcode-cn.com/problems/two-sum/)

### 题目

给定一个整数数组 nums 和一个目标值 target，请你在该数组中找出和为目标值的那 两个 整数，并返回他们的数组下标。

你可以假设每种输入只会对应一个答案。但是，数组中同一个元素不能使用两遍。

**示例：**

```bash
给定 nums = [2, 7, 11, 15], target = 9

因为 nums[0] + nums[1] = 2 + 7 = 9
所以返回 [0, 1]
```

### 解答
大多数人拿到这一题的想法就是两个 for 循环去解。但是我们想一想，双重循环的时间复杂度为 $O(n^2)$ 有没有更快的方法呢？

**有，答案就是空间换时间。**

我们在双重循环的方法中，第二层循环其实就是在找 `target - num[i]`。我们利用**哈希表**，可以将第二层查找的时间复杂度降为 $O(1)$。

```js
/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    const n = nums.length
    const hmap = new Map()
    for (let i = 0; i < n; i++) {
        const secondNum = target - nums[i]
        if (hmap.has(secondNum)) {
            return [hmap.get(secondNum), i]
        } 
        hmap.set(nums[i], i)
    }
};
```

> 其实后面的两道题没有用到哈希表，因为使用哈希表会复杂一些。由于这几道题经常一起出现，所以博主在这里也写了，如果对非哈希表不感兴趣，那么后面就可以不看了。

## [三数之和](https://leetcode-cn.com/problems/3sum/)

### 题目
给你一个包含 n 个整数的数组 nums，判断 nums 中是否存在三个元素 a，b，c ，使得 a + b + c = 0 ？请你找出所有满足条件且不重复的三元组。

**注意：答案中不可以包含重复的三元组。**

示例：

```bash
给定数组 nums = [-1, 0, 1, 2, -1, -4]，

满足要求的三元组集合为：
[
  [-1, 0, 1],
  [-1, -1, 2]
]
```

### 解答
这一题和上一题不同，首先它求的不再是索引，其次它给定了固定的目标值 0，最后它可能有多个解。这一题当然也可以使用三层循环去解，但是时间复杂度太高。并且这里还有一个细节需要注意，我们的结果里需要去除重复的答案。

由于不要求返回索引，我们可以想到一种方法，就是先对给定的数组进行排序，排序之后利用双指针的技巧，我们可以用 $O(n)$ 的时间复杂度找到两数之和等于第三个数。

```javascript
/**
 * @param {number[]} nums
 * @return {number[][]}
 */
var threeSum = function(nums) {
    const n = nums.length
    if (n < 3) return []
    const ans = []
    nums.sort((a, b) => a - b)
    for (let i = 0; i < n - 2; i++) {
        // 优化：数组已经按从小到大的顺序排序了，如果第一个数大于0，那么这题无解
        if (nums[i] > 0) break
        // 审题：题目中声明了不可以包含重复的三元组
        if (i > 0 && nums[i] === nums[i - 1]) continue
        // 技巧：在排序的基础上，使用双指针进行查找剩下的两个数
        let l = i + 1
        let r = n - 1
        while (l < r) {
            const sum = nums[i] + nums[l] + nums[r]
            if (sum === 0) {
                ans.push([nums[i], nums[l], nums[r]])
                while (l < r && nums[l + 1] === nums[l]) l++ // 去重
                while (l < r && nums[r - 1] === nums[r]) r-- // 去重
                l++
                r--
            } else if (sum < 0) {
                l++
            } else {
                r--
            }
        }
    }
    return ans
};
```

## [四数之和](https://leetcode-cn.com/problems/4sum/)

### 题目
给定一个包含 n 个整数的数组 nums 和一个目标值 target，判断 nums 中是否存在四个元素 a，b，c 和 d ，使得 a + b + c + d 的值与 target 相等？找出所有满足条件且不重复的四元组。

注意：

答案中不可以包含重复的四元组。

**示例：**

```bash
给定数组 nums = [1, 0, -1, 0, -2, 2]，和 target = 0。

满足要求的四元组集合为：
[
  [-1,  0, 0, 1],
  [-2, -1, 1, 2],
  [-2,  0, 0, 2]
]
```

### 解答
如果我们已经掌握了三数之和的技巧，那么解决这一题就没什么大的问题。解题思路就是在三数之和的基础上增加一层循环，话不多说，直接上代码。

```javascript
/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[][]}
 */
var fourSum = function (nums, target) {
    const n = nums.length
    if (n < 4) return []
    nums.sort((a, b) => a - b)
    const ans = []
    for (let i = 0; i < n - 3; i++) {
        if (i > 0 && nums[i] === nums[i - 1]) continue // 去重
        // 优化：利用最大值和最小值快速过滤很多情况
        const min = nums[i] + nums[i + 1] + nums[i + 2] + nums[i + 3]
        if (target < min) break
        const max = nums[n - 4] + nums[n - 3] + nums[n - 2] + nums[n - 1]
        if (target > max) break

        for (let j = i + 1; j < n - 2; j++) {
            if (j > i + 1 && nums[j] === nums[j - 1]) continue // 去重
            // 优化：利用最大值和最小值快速过滤很多情况
            const min = nums[i] + nums[j] + nums[j + 1] + nums[j + 2]
            if (target < min) break
            const max = nums[i] + nums[n - 3] + nums[n - 2] + nums[n - 1]
            if (target > max) break

            let l = j + 1
            let r = n - 1
            while (l < r) {
                const sum = nums[i] + nums[j] + nums[l] + nums[r]
                if (sum === target) {
                    ans.push([nums[i], nums[j], nums[l], nums[r]])
                    while (l < r && nums[l + 1] === nums[l]) l++ // 去重
                    while (l < r && nums[r - 1] === nums[r]) r-- // 去重
                    l++
                    r--
                } else if (sum < target) {
                    l++
                } else {
                    r--
                }
            }
        }
    }

    return ans
};
```

# 总结
哈希表就是一种空间换时间的体现，现在硬件资源越来越便宜，而时间反而越来越昂贵。很多场景下，我们需要极致的性能，这个时候使用哈希表作为一种缓存是不错的选择。
