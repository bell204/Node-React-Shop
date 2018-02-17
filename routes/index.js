var util = require('../middleware/utilities');

//패스 포트 불러 와서 실행.


module.exports.chat= chat;
module.exports.login = login;
module.exports.join = join;
module.exports.friendList = friendList;
module.exports.logout = logout;

// 테스트 삼아 쓸 것



function chat(req, res){
  res.cookie('friendCookie', 'this was set from friendList');
  res.render('chat',
  { title: 'chat',
  session:JSON.stringify(req.session.displayName)
});
};

  function friendList(req, res){
    res.cookie('friendCookie', 'this was set from friendList');

    res.render('friendList',
    {
    title: 'friendList',
    session:JSON.stringify(req.session.displayName)
  });
  };

 function login (req, res){
    res.render("login", {title: 'login'});
  };


  function logout (req, res){
     res.redirect('/');
   };

  function join(req, res){
    res.render('join', { title: 'join' });
  };
