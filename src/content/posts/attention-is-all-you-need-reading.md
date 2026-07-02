---
title: "论文精读：注意力就是你所需要的一切（Attention Is All You Need）"
date: "2026-07-02"
description: "从 seq2seq、RNN/CNN、QKV 到位置编码和长上下文，整理一次从原论文读出来的 Transformer 知识笔记。"
tags: ["论文阅读", "Transformer", "大模型", "深度学习"]
coverColor: "from-indigo-600 to-cyan-500"
---

这篇不是 Transformer 教程大全。我更想把它写成一次读论文之后的清账：哪些概念我原来只是会背，哪些地方其实容易说错，哪些问题放到今天的长上下文模型里又变了味道。

论文是 Vaswani 等人的 [Attention Is All You Need](https://arxiv.org/abs/1706.03762)。标题太有名，以至于它有点害人。很多时候我们记住了口号，反而忘了论文具体在反对什么、替换什么、保留什么。

我读下来最大的感受是：Transformer 不是把 seq2seq 扔了，也不是简单把 RNN 换成一个 attention 层。它保留了 encoder-decoder 的外壳，把序列内部的计算方式从时间步递推，换成了 token 之间的直接交互。

## seq2seq 先别急着忘

seq2seq 说的是一类任务和架构范式：

```text
输入序列 -> Encoder -> 中间表示 -> Decoder -> 输出序列
```

机器翻译就是最典型的例子：

```text
I love machine learning
-> 我 喜欢 机器 学习
```

早期常见做法是 RNN encoder 加 RNN decoder，再挂一个 attention。Transformer 并没有把这个大框架推翻。它仍然有 encoder，也仍然有 decoder。变化发生在内部：encoder 和 decoder 里面不再用 RNN 或 CNN 做主干，而是改成 self-attention、cross-attention、feed-forward network、residual connection、layer normalization 和 positional encoding。

所以我现在会这样区分：

```text
seq2seq 是任务和外壳。
Transformer 是实现这个外壳的一套具体结构。
```

这个区分很有用。否则很容易把 "Transformer 替代 RNN" 误听成 "Transformer 替代 seq2seq"。

## 它到底扔掉了 RNN 的什么

RNN 的中文是循环神经网络。它处理序列的方式很自然：

```text
h_t = f(h_{t-1}, x_t)
```

第 `t` 个位置依赖第 `t-1` 个位置。这个设计有一种很强的顺序感，但问题也在这里：同一句话内部要一步一步算。GPU 想吃满，只能多放几条句子到 batch 里，但长序列训练又要保存每个时间步的 hidden state、gate 和 activation，显存很快顶住。

论文里那句 "memory constraints limit batching across examples" 说的就是这个。不是 RNN 的记忆机制不好，而是 GPU 显存限制了你一次能并行多少条训练样本。

Transformer 的改法很直接：同一句话里的所有位置一起算。每个 token 都可以看其他 token。

```text
RNN:
句子内部串行，句子之间并行。

Transformer:
句子内部并行，句子之间也并行。
```

这就是它加快训练的根本原因。不是魔法，是把原来不适合 GPU 的递推，改成了大矩阵乘法。

但这不等于 Transformer 不受序列长度限制。它只是把限制换了形状。RNN 的限制是 `O(n)` 的串行路径；full self-attention 的限制是 `O(n^2)` 的两两交互。短句子上这是好买卖，1M context 上就不是同一个问题了。

## CNN 为什么也不是最终答案

CNN 的中文是卷积神经网络。用在文本上时，它靠一个固定窗口扫过序列。窗口大小是 `k`，一层就只能看附近 `k` 个 token。

```text
[x1 x2 x3] x4 x5
 x1 [x2 x3 x4] x5
 x1 x2 [x3 x4 x5]
```

它比 RNN 更容易并行，但远距离依赖要靠堆层。如果普通卷积想让第 1 个 token 影响第 n 个 token，大概需要 `O(n/k)` 层。dilated convolution 会好一些，可以到 `O(log_k n)`，但信息仍然要一层层传。

self-attention 的路径短得多。一层里，任意两个位置就能直接连上。

```text
Full self-attention:
token i -> token j
```

当然，代价也清楚：它要计算所有 token pair 的相关性。

## attention 不是这篇论文发明的

这是我一开始最想确认的点。attention 在 Transformer 之前就有了。Bahdanau attention、Luong attention 都是早期机器翻译里很重要的工作。

当时的常见结构是：

```text
RNN encoder + RNN decoder + attention
```

attention 主要帮 decoder 对齐输入句子的位置。比如生成中文 "猫" 时，去英文输入里看 `cat`。

Transformer 的动作不是发明 attention，而是改变它的地位。过去 attention 更像辅助模块，RNN 仍然是主干；Transformer 说，主干也可以交给 attention。

这句话更准：

```text
Transformer 没有发明 attention。
它把 attention 推到了序列建模的中心位置。
```

## QKV 公式到底在算什么

现在大家一提 attention，脑子里一般是这个公式：

```text
Attention(Q, K, V) = softmax(QK^T / sqrt(d_k)) V
```

我喜欢把 QKV 先用人话记住：

```text
Query: 我想找什么？
Key: 我能被什么问题匹配上？
Value: 如果你关注我，我提供什么信息？
```

`QK^T` 算的是匹配分数。softmax 把分数变成注意力权重。最后乘 `V`，就是按权重把信息取回来。

为什么要除以 `sqrt(d_k)`？

因为 `q · k` 是很多维度相乘再相加。`d_k` 越大，点积分数越容易变大。softmax 如果被很大的数推到饱和区，会变得特别尖，梯度也会很小。

所以 scaling 的作用很朴素：

```text
点积分数太大 -> softmax 太尖 -> 梯度变小
除以 sqrt(d_k) -> 分数尺度稳定一些
```

这就是 scaled dot-product attention 里的 "scaled"。

## multi-head 不是为了好看

论文里有一句很容易略过：self-attention 会降低 effective resolution，因为输出是 attention-weighted positions 的平均。

单个 attention head 的输出大概是：

```text
output_i = a_i1 v1 + a_i2 v2 + ... + a_in vn
```

这本质上是加权平均。如果一个位置同时需要主语、宾语、指代、局部短语结构，所有信息都挤在一个平均向量里，细节会混。

multi-head attention 给模型多个视角。每个 head 在自己的子空间里算 attention，最后再拼起来。你可以把它粗略理解成：不要让一个人同时盯所有线索，分几个人各看一部分。

这不保证每个 head 都学到人类能命名的语法功能，但结构上确实给了模型分工的空间。

## decoder 为什么要排成那三步

原始 Transformer 是 encoder-decoder 架构。decoder 的一层长这样：

```text
y
-> Masked Self-Attention
-> Add & Norm
-> Cross-Attention
-> Add & Norm
-> Feed Forward
-> Add & Norm
```

第一步 masked self-attention，是看已经生成的目标端前缀。训练时完整答案都在，但模型不能偷看未来词，所以要把未来位置 mask 掉。

第二步 cross-attention，是拿 decoder 当前状态去看 encoder 的输出。这里：

```text
Q 来自 decoder
K, V 来自 encoder
```

也就是：我已经知道自己前面生成了什么，现在该去输入句子里看哪里？

第三步 feed-forward network，也就是 FFN。它不是 token 之间的信息交换，而是对每个 token 自己的表示做非线性加工。原论文里是两层 MLP：

```text
FFN(x) = max(0, xW1 + b1)W2 + b2
```

attention 负责"从哪里拿信息"，FFN 负责"拿到后怎么加工"。

Add & Norm 则是：

```text
LayerNorm(x + Sublayer(x))
```

`Add` 是 residual connection，把子层输出加回原输入。`Norm` 是 layer normalization，让数值尺度稳定。没有这些东西，多层堆起来会难训很多。

## 位置编码是直接加进去的

self-attention 本身不知道顺序。如果没有位置信息，`dog bites man` 和 `man bites dog` 这种排列差异就很难被结构本身捕捉。

原论文的做法是：

```text
x_pos = token_embedding + positional_encoding
```

位置编码和 token embedding 都是 `d_model` 维，所以可以逐元素相加。

它用的是正弦余弦位置编码：

```text
PE(pos, 2i)   = sin(pos / 10000^(2i / d_model))
PE(pos, 2i+1) = cos(pos / 10000^(2i / d_model))
```

偶数维用 sin，奇数维用 cos，不同维度对应不同频率。低频维度变化慢，高频维度变化快。这样每个位置都有一组可计算的位置向量。

这里有个细节我以前没想清楚：原论文里的 sinusoidal positional encoding 是固定的，不训练。但它不训练，不代表它不影响 embedding 的梯度。

原因是前向已经变了：

```text
有 PE: x = E[token] + PE[pos]
无 PE: x = E[token]
```

后面的 QKV、attention score、loss 都会跟着变。传回 embedding 的梯度当然也会变。只是 PE 自己没有参数，所以不会被更新。

作者也试了 learned positional embedding，结果和 sinusoidal 几乎一样。他们最后选 sinusoidal，是因为它可以按公式算任意位置，形式上更可能外推到比训练时更长的序列。

今天长上下文里常说的 position interpolation、RoPE linear scaling、NTK-aware scaling 是另一条线。比如训练看过 512，推理想跑 4096，可以把位置编号除以 8，把 4096 个位置压回训练时相近的坐标范围。这不是原始 Transformer 的重点，但和这里的位置外推问题是同一个家族。

## 复杂度这件事有时代背景

论文 Section 4 比较 self-attention、RNN 和 CNN。一个常见结论是，当序列长度 `n` 小于表示维度 `d` 时，self-attention 的计算复杂度可能比 RNN 更划算：

```text
Self-attention: O(n^2 d)
RNN:            O(n d^2)
```

约一下就知道条件是：

```text
n < d
```

2017 年机器翻译里，句子通常几十到几百个 subword token，而 `d_model` 是 512 或 1024。这个判断很合理。

但现在 1M context 就完全不是这个量级了：

```text
n = 1,000,000
d = 4096 或 8192
```

这时 `n^2` 会非常恐怖。full attention 不可能天真地照搬。

那为什么不回到 RNN？因为 RNN 把老问题带回来了：串行递推、长距离信息压缩进 hidden state、梯度路径长、硬件利用率差。现代长上下文模型更常见的路线，是保留 Transformer 的并行和直接检索能力，再想办法降低 attention 成本。

比如：

```text
sliding window attention
sparse attention
block attention
KV cache compression
retrieval
SSM / hybrid architecture
```

有意思的是，原论文已经提到一种做法：让 self-attention 只看附近大小为 `r` 的邻域。这样复杂度会降下来，但最大路径长度会从 `O(1)` 变成 `O(n/r)`。这基本就是后面 local attention / sliding window attention 的早期影子。

## 实验部分我只记三件事

我没有逐行细读实验表。对这篇论文来说，实验部分抓住三件事就够了。

第一，机器翻译结果很硬。WMT 2014 英德任务上，Transformer big 做到 28.4 BLEU，超过当时最好的 ensemble 两个 BLEU 以上。base model 也已经超过此前公开结果。

第二，成本低。base model 用 8 张 P100 训练约 12 小时，big model 训练 3.5 天。论文不是只说"这个结构更优雅"，它在当时的主流任务上给出了效果和训练效率的双重证据。

第三，消融实验说明几个设计都不是摆设：multi-head 有用，dropout 很重要，模型变大通常更好，sinusoidal 和 learned positional embedding 效果差不多。

最后他们还做了英文 constituency parsing，说明这个结构不只是机器翻译专用。不过我会把它当补充证据，不会把这部分吹得太大。

## 我最后真正记住的

读完这篇，我不太想再用"Transformer 革命性地提出了 attention"这种说法。它不准确。

我更愿意这样说：

Transformer 把序列建模里的时间步递推，改成了位置之间的直接交互；它用 positional encoding 补上顺序，用 multi-head attention 缓解单一平均的模糊，用 residual 和 layer norm 把深层训练稳住。它赢在一个很具体的组合上：短到中等长度序列里，计算更适合并行硬件，长距离依赖路径也短。

当然，它也留下了新问题。full attention 的 `O(n^2)` 在长上下文时代会变成新的瓶颈。今天很多长上下文、稀疏 attention、检索增强、SSM 和混合架构的工作，本质上都在追问同一个问题：

```text
能不能保留 attention 的直接查找能力，
又不为所有 token pair 都付一次账？
```

这才是我觉得最值得从原论文里带走的东西。它不是终点。它只是把序列建模的问题，推到了一个更适合大规模计算、也更容易暴露新瓶颈的位置。
