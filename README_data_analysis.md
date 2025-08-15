# 问卷数据分析工具

这是一个用于分析问卷数据的Python工具，支持PCA降维和K-means聚类分析。

## 功能特点

- **数据加载**: 支持CSV和Excel格式的问卷数据
- **数据预处理**: 自动处理缺失值、标准化数值变量
- **PCA降维**: 自动确定最优主成分数量，可视化解释方差
- **K-means聚类**: 使用肘部法则和轮廓系数自动选择最优聚类数
- **结果可视化**: 生成聚类结果图表和特征分析
- **结果导出**: 保存聚类结果到CSV文件

## 安装依赖

```bash
pip install -r requirements.txt
```

## 使用方法

### 1. 准备数据

将您的问卷数据保存为CSV或Excel格式，确保：
- 包含数值型变量（用于分析）
- 可以包含非数值列（如ID、姓名等，分析时会自动排除）

### 2. 基本使用

```python
from data_analysis import QuestionnaireAnalyzer

# 创建分析器
analyzer = QuestionnaireAnalyzer()

# 运行完整分析
analyzer.run_analysis(
    file_path='your_data.csv',
    exclude_columns=['ID', '姓名'],  # 排除不需要分析的列
    n_clusters=3  # 指定聚类数，或设为None自动选择
)
```

### 3. 分步使用

```python
# 1. 加载数据
analyzer.load_data('your_data.csv')

# 2. 数据预处理
analyzer.preprocess_data(exclude_columns=['ID', '姓名'])

# 3. PCA降维
analyzer.perform_pca()

# 4. 查看PCA结果
analyzer.plot_pca_variance()

# 5. 找到最优聚类数
optimal_k = analyzer.find_optimal_clusters()

# 6. 执行聚类
analyzer.perform_kmeans(optimal_k)

# 7. 查看聚类结果
analyzer.plot_clusters()

# 8. 分析聚类特征
analyzer.analyze_cluster_characteristics()

# 9. 保存结果
analyzer.save_results('my_results.csv')
```

## 输出结果

### 1. 可视化图表
- **PCA解释方差图**: 显示各主成分的解释方差比例
- **聚类结果图**: 2D和3D散点图显示聚类结果
- **聚类分布图**: 显示各聚类的样本数量

### 2. 分析报告
- 数据预处理信息
- PCA降维结果
- 最优聚类数建议
- 各聚类的特征分析
- 聚类结果分布

### 3. 结果文件
- `cluster_results.csv`: 包含原始数据和聚类标签的结果文件

## 示例数据

运行示例脚本查看效果：

```bash
python example_usage.py
```

这将创建示例数据并运行完整分析流程。

## 数据格式要求

### 支持的变量类型
- **数值型变量**: 年龄、收入、评分等
- **分类变量**: 会自动转换为数值（如果可能）

### 数据预处理
- 自动处理缺失值（用均值填充）
- 自动标准化数值变量
- 自动排除非数值列

## 参数说明

### run_analysis() 参数
- `file_path`: 数据文件路径
- `exclude_columns`: 要排除的列名列表
- `n_clusters`: 聚类数量（None为自动选择）

### perform_pca() 参数
- `n_components`: 主成分数量（None为自动确定）
- `explained_variance_threshold`: 解释方差阈值（默认0.95）

### find_optimal_clusters() 参数
- `max_clusters`: 最大聚类数（默认10）

## 注意事项

1. **数据质量**: 确保数据质量良好，缺失值较少
2. **变量选择**: 选择有意义的数值变量进行分析
3. **聚类解释**: 结合业务背景解释聚类结果
4. **结果验证**: 使用多种方法验证聚类结果的合理性

## 故障排除

### 常见问题
1. **数据加载失败**: 检查文件路径和格式
2. **内存不足**: 减少数据量或使用更少的变量
3. **聚类效果差**: 尝试不同的聚类数或检查数据质量

### 调试建议
- 先使用小数据集测试
- 检查数据预处理结果
- 观察PCA解释方差图
- 分析聚类特征的可解释性 