from flask import Flask, render_template, request, jsonify, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
import numpy as np
from keras.models import load_model
import cv2
from datetime import datetime
import os
from flask_mail import Mail, Message



# アプリケーションの設定
app = Flask(__name__)
secret_key = os.urandom(24)   #本番環境では一貫性を意識する
app.config['SECRET_KEY'] = secret_key
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['CORS_HEADERS'] = 'Content-Type'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///yourdatabase.db'

# Flask-Mailの設定
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USERNAME'] = 'hiromureve1522@gmail.com'
app.config['MAIL_PASSWORD'] = 'ejgy xthj tyfi ikoa'
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USE_SSL'] = False

mail = Mail(app)

# データベースとログインマネージャーの初期化
db = SQLAlchemy(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    country = db.Column(db.String(100))  # 国
    city = db.Column(db.String(100))     # 都市
    birth_date = db.Column(db.Date)      # 生年月日
    password_hash = db.Column(db.String(128))

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)



# モデルの読み込みとデータの準備
model = load_model("keras_Model.h5", compile=False)
with open('labels.txt', 'r', encoding="utf-8") as file:
    class_names = [line.strip() for line in file.readlines()]
with open('explanation.txt', 'r', encoding="utf-8") as file:
    explanations = [line.strip() for line in file.readlines()]

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# ルート定義
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('index'))  # ログイン済みの場合、メインページへリダイレクト

    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        
        user = User.query.filter_by(email=email).first()

        # ユーザーの存在とパスワードの存在を確認し、正しい場合にのみログイン処理を実行
        if user is not None and user.check_password(password):
            # ログイン処理
            login_user(user)
            return redirect(url_for('home'))
        else:
            flash('Invalid email or password.')

    return render_template('login.html')


@app.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('index'))  # メインページへリダイレクト

    if request.method == 'POST':
        # フォームデータの取得
        name = request.form.get('name')
        email = request.form.get('email')
        password = request.form.get('password')
        password2 = request.form.get('password2')
        country = request.form.get('country')
        city = request.form.get('city')
        birth_date_str = request.form.get('birth_date')

        # データのバリデーション
        if not all([name, email, password, password2, country, city, birth_date_str]):
            flash('All fields are required.')
            return redirect(url_for('register'))

        if password != password2:
            flash('Passwords do not match.')
            return redirect(url_for('register'))

        # 生年月日の変換
        try:
            birth_date = datetime.strptime(birth_date_str, '%Y-%m-%d').date()
        except ValueError:
            flash('Invalid date format. Please use YYYY-MM-DD format.')
            return redirect(url_for('register'))

        # 既存のユーザーの確認
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            flash('Email already exists.')
            return redirect(url_for('register'))

        # 新規ユーザーの作成
        new_user = User(
            name=name,
            email=email,
            country=country,
            city=city,
            birth_date=birth_date
        )
        new_user.set_password(password)

        # データベースへの保存
        db.session.add(new_user)
        db.session.commit()

        flash('Congratulations, you are now a registered user!')
        return redirect(url_for('login')) # 登録成功後、メインページへリダイレクト

    return render_template('register.html')





@app.route('/purpose')
def purpose():
    return render_template('purpose.html')

@app.route('/service')
def service():
    return render_template('service.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return render_template('logout.html')

@app.route('/mypage')
@login_required
def mypage():
    user = current_user
    # データベースからユーザー情報を再度読み込む（必要に応じて）
    db.session.refresh(user)
    return render_template('mypage.html', user=user)

@app.route('/settings')
def settings():
    return render_template('settings.html', user=current_user)


@app.route('/update-settings', methods=['POST'])
@login_required
def update_settings():
    user = current_user

    # ユーザー名の更新
    username = request.form.get('username').strip()
    if username and username != user.username:
        existing_user = User.query.filter_by(username=username).first()
        if existing_user:
            flash('このユーザー名はすでに使われています。')
            return redirect(url_for('settings'))
        else:
            user.username = username

    # メールアドレスの更新
    email = request.form.get('email').strip()
    if email and email != user.email:
        user.email = email

    # パスワードの更新
    password = request.form.get('password').strip()
    if password:
        user.password_hash = generate_password_hash(password)

    # プロフィール画像の更新（任意で）
    # ...

    try:
        # 更新内容をデータベースにコミット
        db.session.commit()
        flash('設定が正常に更新されました。')

        # 更新したユーザー情報でログインセッションを更新
        login_user(user, remember=True)
    except Exception as e:
        # エラーログを出力
        print(e)
        # データベースセッションをロールバック
        db.session.rollback()
        flash('更新中にエラーが発生しました。')

    return redirect(url_for('settings'))



@app.route('/contact')
def contact():
    return render_template('contact.html',user=current_user)

@app.route('/submit_contact', methods=['POST'])
def submit_contact():
    name = request.form.get('名前')
    email = request.form.get('メール')
    job = request.form.get('職業')
    inquiry = request.form.get('問い合わせ')

    msg = Message("お問い合わせフォームからのメッセージ",
                  sender=email,
                  recipients=['c1219393@st.kanazawa-it.ac.jp'])
    msg.body = f"名前: {name}\nメール: {email}\n職業: {job}\nお問い合わせ内容: {inquiry}"
    mail.send(msg)

    return 'メッセージを送信しました。'



@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({'error': '画像ファイルが提供されていません。'}), 400

    file = request.files['image']
    
    # 画像形式のチェック (例: JPEG, PNG)
    if not file.content_type in ['image/jpeg', 'image/png']:
        return jsonify({'error': 'サポートされていないファイル形式です。画像ファイル（JPEG、PNG）を選択してください。'}), 400

    data = file.read()
    npimg = np.frombuffer(data, np.uint8)

    image = cv2.imdecode(npimg, cv2.IMREAD_COLOR)
    if image is None:
        return jsonify({'error': '画像の読み込みに失敗しました。'}), 400

    # Process the image
    try:
        image = cv2.resize(image, (224, 224), interpolation=cv2.INTER_AREA)
        image = np.asarray(image, dtype=np.float32).reshape(1, 224, 224, 3)
        image = (image / 127.5) - 1

        # Predict
        prediction = model.predict(image)
    except Exception as e:
        return jsonify({'error': '予測処理中にエラーが発生しました。'}), 500

    index = np.argmax(prediction)
    class_name = class_names[index].strip()
    confidence_score = prediction[0][index]
    explanation = explanations[index] # 予測されたクラスに対応する説明を取得

    return jsonify({
        'class': class_name,
        'confidence_score': str(np.round(confidence_score * 100))[:-2],
        'explanation': explanation
    })

# メイン関数
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
