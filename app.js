// module dependency

var express = require('express');
var http = require('http'); //socket 위해
var app = express();

var routes = require('./routes');
var path = require('path');
var log = require('./middleware/log');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
//var redisStore = require('connect-redis')(session);
//var redis = require('redis');
// var client= redis.createClient();
var config = require('./config');
var server = http.createServer(app);
var io = require('socket.io').listen(server);
var csrf= require('csurf');
var util= require('./middleware/utilities');

//mysql
var fs= require('fs');
var ejs= require('ejs');
var mysql= require('mysql');

// var client = mysql.createConnection({
//   user: 'root',
//   password: 'root',
//   database: 'Company'
// });


var passport = require('passport');
var facebook = require('passport-facebook').Strategy;

// 포트 연동 // 뷰 연동
app.set('port', process.env.PORT || config.port);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// 미들웨어 등록
// 빈도수 고려해서 위치 정하기
app.use(log.logger);
app.use(express.static(path.join(__dirname, 'public')));

// 세션 미들웨어와 같은 시크릿을 사용하도록 변경해야 액세스 가능.
app.use(cookieParser(config.secret));

// //기본 세션
app.use(session({
    key:'sid',
    secret: config.secret, // 저장되는 데이터 암호화 위해 필요.
    resave: false, // 접속할 때마다 세션 발급되지 않게 해야 하므로
    saveUninitialized: true // 맨 처음 세션 강제로 저장 (방문자에게 고유 식별값)

    //레디스 스토어 이용
    // store: new redisStore({
    //       host: "localhost",
    //       port: 6379,
    //       client: client,
    //       prefix : "session",
    //       db : 0
    //     }),

}));

app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// 세션에 토큰 추가
// app.use(csrf());
// 세션에서 csrf토큰을 가져와 템플릿이 사용할 수 있도록 함.
// app.use(util.csrf);


// 세션에 간단한 페이지 카운터를 만들자.
// 세션 미들웨어에서 이 작업을 해야 req.session에 접근할 수 있다.

app.get(config.routes.login, routes.login);

                passport.use(new facebook({
                    clientID: config.facebook.appID,
                    clientSecret: config.facebook.appSecret,
                    callbackURL: "/auth/facebook/callback" // 이 주소가
                  },
                  function(accessToken, refreshToken, profile, done) {
                     done(null, profile);
                    }  ));
                    passport.serializeUser(function(user, done){
                      done(null, user);
                    });
                    // done 함수가 사용자 세션에서 끊음.
                    passport.deserializeUser(function(user, done){
                      done(null, user);
                    });


        app.get('/auth/facebook',
          passport.authenticate(
            'facebook'
          )
        );

        app.get('/auth/facebook/callback',
          passport.authenticate( 'facebook',
          {successRedirect:'/friendList',
            failureRedirect: '/auth/login'}
          )
        );



//라우트
// app.get('/count', function(req, res){
//   if(req.session.count){ // 있을 때=두번째 접속부터 이것이 작동
//     req.session.count++;
//   }else{ // 없을 경우= 처음 접속
//       req.session.count=1;
//   }
//   res.send('count:' +req.session.count);
// });

//첫 창이 로그인
app.get('/', routes.login);
 

app.get(config.routes.login, function(req, res){
  if(req.session.displayName){
    res.render(rounts.friendList);
  }else{
      res.redirect('/auth/login');
  }
})


// 로그아웃
app.get(config.routes.logout, function(req, res){
  // req.session.destroy(); // 세션 삭제
  res.clearCookie('sid'); // 세션 쿠키 삭제
  delete req.session.displayName;
  res.redirect('/auth/login');
})


// 여기에 친구 목록 나오게
app.get(config.routes.friendList, routes.friendList);

//채팅방
app.get(config.routes.chat, routes.chat);

// 회원가입
app.get(config.routes.join, routes.join);

// /chat 라우팅에 대해서만 실행된다.
// 관리자에 접근 못하는 것과 같음.


// 로그인
app.post('/auth/login', function(req,res){
  var user =
    {
      username: 'admin',
      password: 'admin',
      displayName: 'admin'
    };


  // post 방식으로 보낸 값 가져옴. (위의 user 값과 비교)
  var uname = req.body.username;
  var pwd= req.body.password;

// 세션을 -> 레디스 세션으로 바꿔야 함.
  if(uname === user.username && pwd === user.password){//아이디와 패스워드 둘다 같으면
      req.session.displayName= user.displayName;
      res.redirect('/friendList');
  }else{//비밀번호가 틀리면
    res.redirect('/auth/login');
  }
  });


server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

//레디스
// client.subscribe('testpubsub');

// 소켓 연결 이벤트
io.sockets.on('connection', function(socket) {

  // Join Room (룸이름 데이터 받음)

  socket.on('join', function(data) {

    //방 이름 받음.
    console.log(data+'번방');

    socket.join(data);
    //잠시 주석
    socket.set('room', data);

//레디스
    // client.set('room', data);
  });

  // Broadcast to room
  // client.on('msg', function(room, data){
  //   socket.emit('pubsub', {room: room, msg, msg})
  // });

 socket.on('msg', function(data) {
    // 레디스 추가
    socket.get('room', function(error, room){
      // msg 이벤트를 보냄. data는 룸과 data(msg내용)
        io.sockets.in(room).emit('msg', data, room)
    })
  })
})
