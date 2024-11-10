# ベースイメージを指定
FROM python:3.10-slim

# 作業ディレクトリを設定
WORKDIR /app

# 必要なシステムパッケージをインストール
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# 環境変数を設定
ENV FLASK_APP=app.py
ENV FLASK_RUN_HOST=0.0.0.0
ENV FLASK_ENV=production  

# 開発時には "development" に設定

# 依存関係ファイルを追加
COPY requirements.txt .

# 依存関係をインストール
RUN pip install --no-cache-dir -r requirements.txt

# アプリケーションコードを追加
COPY . .

# ポート5000を開放
EXPOSE 5000

# Flaskアプリを実行
CMD ["flask", "run"]

