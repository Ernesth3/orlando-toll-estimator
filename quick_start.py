#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
快速开始脚本 - 问卷数据分析
"""

import os
import sys

def check_python_version():
    """检查Python版本"""
    if sys.version_info < (3, 7):
        print("错误: 需要Python 3.7或更高版本")
        print(f"当前版本: {sys.version}")
        return False
    print(f"Python版本检查通过: {sys.version}")
    return True

def check_dependencies():
    """检查依赖包"""
    required_packages = [
        'pandas', 'numpy', 'matplotlib', 'seaborn', 
        'sklearn', 'openpyxl'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package)
            print(f"✓ {package} 已安装")
        except ImportError:
            missing_packages.append(package)
            print(f"✗ {package} 未安装")
    
    if missing_packages:
        print(f"\n缺少依赖包: {', '.join(missing_packages)}")
        print("请运行: pip install -r requirements.txt")
        return False
    
    print("所有依赖包检查通过！")
    return True

def create_sample_data():
    """创建示例数据"""
    try:
        import pandas as pd
        import numpy as np
        
        print("创建示例数据...")
        
        np.random.seed(42)
        n_samples = 100
        
        data = {
            '年龄': np.random.normal(35, 10, n_samples),
            '收入': np.random.normal(50000, 15000, n_samples),
            '教育程度': np.random.choice([1, 2, 3, 4], n_samples, p=[0.2, 0.3, 0.3, 0.2]),
            '满意度': np.random.normal(7, 2, n_samples),
            '使用频率': np.random.normal(5, 2, n_samples),
            '推荐意愿': np.random.normal(6, 2, n_samples)
        }
        
        # 确保数值在合理范围内
        data['年龄'] = np.clip(data['年龄'], 18, 70)
        data['收入'] = np.clip(data['收入'], 20000, 100000)
        data['满意度'] = np.clip(data['满意度'], 1, 10)
        data['使用频率'] = np.clip(data['使用频率'], 1, 10)
        data['推荐意愿'] = np.clip(data['推荐意愿'], 1, 10)
        
        df = pd.DataFrame(data)
        df.to_csv('sample_data.csv', index=False, encoding='utf-8-sig')
        print("示例数据已创建: sample_data.csv")
        return True
        
    except Exception as e:
        print(f"创建示例数据失败: {e}")
        return False

def run_analysis():
    """运行分析"""
    try:
        from data_analysis import QuestionnaireAnalyzer
        
        print("\n开始数据分析...")
        print("=" * 50)
        
        analyzer = QuestionnaireAnalyzer()
        
        # 运行完整分析
        analyzer.run_analysis(
            file_path='sample_data.csv',
            exclude_columns=[],
            n_clusters=3
        )
        
        print("\n分析完成！")
        print("结果文件: cluster_results.csv")
        return True
        
    except Exception as e:
        print(f"分析失败: {e}")
        return False

def main():
    """主函数"""
    print("问卷数据分析工具 - 快速开始")
    print("=" * 50)
    
    # 1. 检查Python版本
    if not check_python_version():
        return
    
    # 2. 检查依赖包
    if not check_dependencies():
        return
    
    # 3. 创建示例数据
    if not os.path.exists('sample_data.csv'):
        if not create_sample_data():
            return
    
    # 4. 运行分析
    if not run_analysis():
        return
    
    print("\n" + "=" * 50)
    print("快速开始完成！")
    print("\n接下来您可以:")
    print("1. 查看生成的图表和结果")
    print("2. 使用您自己的数据文件进行分析")
    print("3. 修改参数以获得更好的分析结果")

if __name__ == "__main__":
    main() 