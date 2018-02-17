module.exports.csrf = function csrf(req, res, next){
  //res.locals는 응답에 액세스할 수 있는 모든 템플릿에 사용할 수 있는 특별한 객체.
  res.locals.token= req.csrfToken();
  next();
}

module.exports.authenticated = function authenticated(req, res, next){
	req.session.isAuthenticated = req.session.passport.user !== undefined;
	res.locals.isAuthenticated = req.session.isAuthenticated;
	if (req.session.isAuthenticated) {
		res.locals.user = req.session.passport.user;
	}
	next();
};

module.exports.logout = function logout(req){
  // 세션 종료시 로그아웃 함수 호출.
  req.session.isAuthenticated = false;
	req.logout();
};
