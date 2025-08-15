#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
问卷数据分析示例脚本
使用PCA降维和K-means聚类分析问卷数据
"""

from data_analysis import QuestionnaireAnalyzer
import pandas as pd
import numpy as np

def create_sample_data():
    """
    创建示例问卷数据
    """
    np.random.seed(42)
    n_samples = 200
    
    # 创建示例数据
    data = {
        '年龄': np.random.normal(35, 10, n_samples),
        '收入': np.random.normal(50000, 15000, n_samples),
        '教育程度': np.random.choice([1, 2, 3, 4], n_samples, p=[0.2, 0.3, 0.3, 0.2]),
        '满意度': np.random.normal(7, 2, n_samples),
        '使用频率': np.random.normal(5, 2, n_samples),
        '推荐意愿': np.random.normal(6, 2, n_samples),
        '问题数量': np.random.poisson(3, n_samples),
        '响应时间': np.random.exponential(2, n_samples)
    }
    
    # 确保数值在合理范围内
    data['年龄'] = np.clip(data['年龄'], 18, 70)
    data['收入'] = np.clip(data['收入'], 20000, 100000)
    data['满意度'] = np.clip(data['满意度'], 1, 10)
    data['使用频率'] = np.clip(data['使用频率'], 1, 10)
    data['推荐意愿'] = np.clip(data['推荐意愿'], 1, 10)
    data['响应时间'] = np.clip(data['响应时间'], 0.1, 10)
    
    df = pd.DataFrame(data)
    df.to_csv('sample_questionnaire_data.csv', index=False, encoding='utf-8-sig')
    print("示例数据已创建: sample_questionnaire_data.csv")
    return df

def main():
    """
    主函数 - 演示数据分析流程
    """
    print("问卷数据分析工具演示")
    print("=" * 50)
    
    # 创建示例数据（如果不存在）
    try:
        df = pd.read_csv('sample_questionnaire_data.csv')
        print("找到现有数据文件")
    except FileNotFoundError:
        print("创建示例数据...")
        df = create_sample_data()
    
    # 创建分析器实例
    analyzer = QuestionnaireAnalyzer()
    
    # 运行完整分析
    print("\n开始分析...")
    analyzer.run_analysis(
        file_path='sample_questionnaire_data.csv',
        exclude_columns=[],  # 不排除任何列
        n_clusters=3  # 可以设置为None让程序自动选择最优聚类数
    )
    
    print("\n分析完成！")
    print("结果文件: cluster_results.csv")

if __name__ == "__main__":
    main() 