# 第三方资料说明

- CET-4与高中候选词形参考公开考试词表及 [KyleBing/english-vocabulary](https://github.com/KyleBing/english-vocabulary)。本项目未直接复制其网站代码。
- 近义词、反义词候选使用 [Open English WordNet](https://github.com/globalwordnet/english-wordnet) 辅助校验；WordNet相关资源遵循其原许可。
- 词频筛选使用开源 Python 包 [wordfreq](https://github.com/rspeer/wordfreq)。这些构建工具不参与网站运行。
- 中文补充释义参照 [ECDICT](https://github.com/skywind3000/ECDICT) 的词性标注和英汉释义，经过清理和筛选；没有足够可靠义项的单词不强行补满三项。ECDICT 的原始 CSV 不随网站发布。其 MIT 许可如下。

最终词表经过面向高中125分学习者的二次筛选、重新分组与教材化编排。例句、记忆提示、练习和网站代码由本项目生成。

## ECDICT MIT License

Copyright (c) 2025 Linwei

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
