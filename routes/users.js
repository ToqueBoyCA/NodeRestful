var express = require('express');
var router = express.Router();

/* GET userlist. */
router.get('/userlist', function(req, res) {
	var db = req.db;
	var collection = db.get('userlist');
	collection.find({},{},function(e,docs){
		res.json(docs);
	});
});

/*
/* POST to adduser.
*/
router.post('/adduser', function(req, res) {
	var db = req.db;
	var collection = db.get('userlist');
	collection.insert(req.body, function(err,result){
		res.send(
			(err === null) ? {msg: ''} : {msg: err}
		);
	});
});	

/*
/* DELETE to deleteuser
*/
router.delete('/deleteuser/:id',function(req,res){
	var db = req.db;
	var collection = db.get('userlist');
	var userToDelete = req.params.id;
	collection.remove({'_id' : userToDelete }, function(err){
		res.send((err === null) ? {msg:''} : {msg:'error: ' +err });
	});
});

/*
/* PUT to updateuser
*/
router.put('/updateuser/:id', function(req, res) {
	var db = req.db;
  var userToUpdate = req.params.id;
  var doc = { $set: req.body};
	var collection = db.get('userlist')
	console.log('Updating user: '+userToUpdate);
  collection.updateById(userToUpdate, doc ,function(err, result) {
    res.send(
			(result === 1) ? { msg: '' } : { msg:'error: ' + err }
		);
  });
});
module.exports = router;