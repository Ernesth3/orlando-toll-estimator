import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
import warnings
warnings.filterwarnings('ignore')

class QuestionnaireAnalyzer:
    def __init__(self):
        self.data = None
        self.scaled_data = None
        self.pca = None
        self.pca_data = None
        self.kmeans = None
        self.clusters = None
        
    def load_data(self, file_path):
        """
        加载问卷数据
        支持CSV、Excel等格式
        """
        try:
            if file_path.endswith('.csv'):
                self.data = pd.read_csv(file_path)
            elif file_path.endswith(('.xlsx', '.xls')):
                self.data = pd.read_excel(file_path)
            else:
                raise ValueError("不支持的文件格式，请使用CSV或Excel文件")
            
            print(f"数据加载成功！数据形状: {self.data.shape}")
            print(f"列名: {list(self.data.columns)}")
            return True
        except Exception as e:
            print(f"数据加载失败: {e}")
            return False
    
    def preprocess_data(self, exclude_columns=None):
        """
        数据预处理
        - 处理缺失值
        - 标准化数值变量
        - 排除不需要的列
        """
        if self.data is None:
            print("请先加载数据")
            return False
        
        # 复制数据
        processed_data = self.data.copy()
        
        # 排除不需要的列
        if exclude_columns:
            processed_data = processed_data.drop(columns=exclude_columns, errors='ignore')
        
        # 只保留数值列
        numeric_columns = processed_data.select_dtypes(include=[np.number]).columns
        processed_data = processed_data[numeric_columns]
        
        # 处理缺失值
        processed_data = processed_data.fillna(processed_data.mean())
        
        # 标准化数据
        scaler = StandardScaler()
        self.scaled_data = scaler.fit_transform(processed_data)
        
        print(f"数据预处理完成！处理后数据形状: {self.scaled_data.shape}")
        return True
    
    def perform_pca(self, n_components=None, explained_variance_threshold=0.95):
        """
        执行PCA降维
        """
        if self.scaled_data is None:
            print("请先进行数据预处理")
            return False
        
        # 如果没有指定组件数，根据解释方差确定
        if n_components is None:
            pca_temp = PCA()
            pca_temp.fit(self.scaled_data)
            cumulative_variance = np.cumsum(pca_temp.explained_variance_ratio_)
            n_components = np.argmax(cumulative_variance >= explained_variance_threshold) + 1
        
        # 执行PCA
        self.pca = PCA(n_components=n_components)
        self.pca_data = self.pca.fit_transform(self.scaled_data)
        
        print(f"PCA降维完成！")
        print(f"原始维度: {self.scaled_data.shape[1]}")
        print(f"降维后维度: {self.pca_data.shape[1]}")
        print(f"解释方差比例: {self.pca.explained_variance_ratio_.sum():.4f}")
        
        return True
    
    def plot_pca_variance(self):
        """
        绘制PCA解释方差图
        """
        if self.pca is None:
            print("请先执行PCA")
            return
        
        plt.figure(figsize=(12, 5))
        
        # 解释方差比例
        plt.subplot(1, 2, 1)
        plt.plot(range(1, len(self.pca.explained_variance_ratio_) + 1), 
                self.pca.explained_variance_ratio_, 'bo-')
        plt.xlabel('主成分')
        plt.ylabel('解释方差比例')
        plt.title('各主成分解释方差比例')
        plt.grid(True)
        
        # 累积解释方差
        plt.subplot(1, 2, 2)
        cumulative_variance = np.cumsum(self.pca.explained_variance_ratio_)
        plt.plot(range(1, len(cumulative_variance) + 1), cumulative_variance, 'ro-')
        plt.xlabel('主成分数量')
        plt.ylabel('累积解释方差比例')
        plt.title('累积解释方差比例')
        plt.grid(True)
        
        plt.tight_layout()
        plt.show()
    
    def find_optimal_clusters(self, max_clusters=10):
        """
        使用肘部法则和轮廓系数找到最优聚类数
        """
        if self.pca_data is None:
            print("请先执行PCA")
            return None
        
        inertias = []
        silhouette_scores = []
        K_range = range(2, max_clusters + 1)
        
        for k in K_range:
            kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
            kmeans.fit(self.pca_data)
            inertias.append(kmeans.inertia_)
            
            if k > 1:
                silhouette_avg = silhouette_score(self.pca_data, kmeans.labels_)
                silhouette_scores.append(silhouette_avg)
        
        # 绘制肘部图
        plt.figure(figsize=(12, 5))
        
        plt.subplot(1, 2, 1)
        plt.plot(K_range, inertias, 'bo-')
        plt.xlabel('聚类数')
        plt.ylabel('惯性')
        plt.title('肘部法则')
        plt.grid(True)
        
        plt.subplot(1, 2, 2)
        plt.plot(K_range[1:], silhouette_scores, 'ro-')
        plt.xlabel('聚类数')
        plt.ylabel('轮廓系数')
        plt.title('轮廓系数')
        plt.grid(True)
        
        plt.tight_layout()
        plt.show()
        
        # 返回最优聚类数
        optimal_k = K_range[np.argmax(silhouette_scores) + 1]
        print(f"建议的最优聚类数: {optimal_k}")
        return optimal_k
    
    def perform_kmeans(self, n_clusters):
        """
        执行K-means聚类
        """
        if self.pca_data is None:
            print("请先执行PCA")
            return False
        
        self.kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        self.clusters = self.kmeans.fit_predict(self.pca_data)
        
        print(f"K-means聚类完成！聚类数: {n_clusters}")
        print(f"聚类结果分布:")
        unique, counts = np.unique(self.clusters, return_counts=True)
        for cluster, count in zip(unique, counts):
            print(f"  聚类 {cluster}: {count} 个样本")
        
        return True
    
    def plot_clusters(self):
        """
        绘制聚类结果
        """
        if self.clusters is None:
            print("请先执行聚类")
            return
        
        plt.figure(figsize=(15, 5))
        
        # 前两个主成分的散点图
        plt.subplot(1, 3, 1)
        scatter = plt.scatter(self.pca_data[:, 0], self.pca_data[:, 1], 
                            c=self.clusters, cmap='viridis', alpha=0.6)
        plt.xlabel('第一主成分')
        plt.ylabel('第二主成分')
        plt.title('聚类结果 (前两个主成分)')
        plt.colorbar(scatter)
        
        # 前三个主成分的3D图
        if self.pca_data.shape[1] >= 3:
            ax = plt.subplot(1, 3, 2, projection='3d')
            scatter = ax.scatter(self.pca_data[:, 0], self.pca_data[:, 1], self.pca_data[:, 2],
                               c=self.clusters, cmap='viridis', alpha=0.6)
            ax.set_xlabel('第一主成分')
            ax.set_ylabel('第二主成分')
            ax.set_zlabel('第三主成分')
            ax.set_title('聚类结果 (前三个主成分)')
        
        # 聚类大小分布
        plt.subplot(1, 3, 3)
        unique, counts = np.unique(self.clusters, return_counts=True)
        plt.bar(unique, counts, color=plt.cm.viridis(unique / max(unique)))
        plt.xlabel('聚类')
        plt.ylabel('样本数量')
        plt.title('各聚类样本数量')
        
        plt.tight_layout()
        plt.show()
    
    def analyze_cluster_characteristics(self):
        """
        分析各聚类的特征
        """
        if self.clusters is None or self.data is None:
            print("请先执行聚类并加载原始数据")
            return
        
        # 将聚类结果添加到原始数据中
        data_with_clusters = self.data.copy()
        data_with_clusters['Cluster'] = self.clusters
        
        # 分析各聚类的数值特征
        numeric_columns = data_with_clusters.select_dtypes(include=[np.number]).columns
        numeric_columns = [col for col in numeric_columns if col != 'Cluster']
        
        if len(numeric_columns) > 0:
            cluster_stats = data_with_clusters.groupby('Cluster')[numeric_columns].agg(['mean', 'std'])
            
            print("\n各聚类特征分析:")
            print("=" * 50)
            
            for cluster in sorted(data_with_clusters['Cluster'].unique()):
                print(f"\n聚类 {cluster} 的特征:")
                cluster_data = data_with_clusters[data_with_clusters['Cluster'] == cluster]
                print(f"样本数量: {len(cluster_data)}")
                
                for col in numeric_columns:
                    mean_val = cluster_data[col].mean()
                    std_val = cluster_data[col].std()
                    print(f"  {col}: 均值={mean_val:.3f}, 标准差={std_val:.3f}")
        
        return data_with_clusters
    
    def save_results(self, output_file='cluster_results.csv'):
        """
        保存聚类结果
        """
        if self.clusters is None or self.data is None:
            print("请先执行聚类并加载原始数据")
            return
        
        results = self.data.copy()
        results['Cluster'] = self.clusters
        
        # 如果有PCA数据，也保存前几个主成分
        if self.pca_data is not None:
            for i in range(min(5, self.pca_data.shape[1])):
                results[f'PC{i+1}'] = self.pca_data[:, i]
        
        results.to_csv(output_file, index=False, encoding='utf-8-sig')
        print(f"结果已保存到: {output_file}")
    
    def run_analysis(self, file_path, exclude_columns=None, n_clusters=None):
        """
        运行完整的分析流程
        """
        print("开始数据分析...")
        print("=" * 50)
        
        # 1. 加载数据
        if not self.load_data(file_path):
            return
        
        # 2. 数据预处理
        if not self.preprocess_data(exclude_columns):
            return
        
        # 3. PCA降维
        if not self.perform_pca():
            return
        
        # 4. 绘制PCA方差图
        self.plot_pca_variance()
        
        # 5. 找到最优聚类数
        if n_clusters is None:
            n_clusters = self.find_optimal_clusters()
        
        # 6. 执行聚类
        if not self.perform_kmeans(n_clusters):
            return
        
        # 7. 绘制聚类结果
        self.plot_clusters()
        
        # 8. 分析聚类特征
        self.analyze_cluster_characteristics()
        
        # 9. 保存结果
        self.save_results()
        
        print("\n分析完成！")

# 使用示例
if __name__ == "__main__":
    analyzer = QuestionnaireAnalyzer()
    
    # 示例：运行分析
    # analyzer.run_analysis('your_questionnaire_data.csv', 
    #                      exclude_columns=['ID', '姓名'], 
    #                      n_clusters=3)
    
    print("数据分析工具已准备就绪！")
    print("请上传您的问卷数据文件，然后调用 run_analysis() 方法进行分析。") 