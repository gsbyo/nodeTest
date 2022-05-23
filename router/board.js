var router = require('express').Router();

let moment = require('moment');

const upload = require('../config/multer');

const posts = require('../schema/post');
const postCount = require('../schema/postCount');
const comments = require('../schema/comment');

const POST_VIEW_COUNT = 5;
const COMMNET_VIEW_COUNT = 5;

function Logged_in(req, res ,next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.send("<script charset='UTF-8'>alert('권한이 없습니다. 로그인 해주세요');location.href='/auth/login';</script>");
    }
}

function getIP(req) {
    const addr = req.headers['x-forwarded-for'] || req.connection.remoteAddress
    return addr;
}

router.get('/', (req, res) => { 
    if(req.query.page == undefined) req.query.page = 1;

    var viewCount = 5;

    posts.find({})
          .skip( viewCount * (req.query.page - 1))
          .limit(viewCount)
          .sort({'seq' : - 1})
          .select('seq title writer day')
          .exec((find_err, data) => {

        postCount.findOne({}).exec((count_err, total) => {
         res.render('board.ejs', { posts : data,  totalCount : total.count } );
        });
    });
})

/*router.get('/:page', (req, res) => {
    if(req.params.page == 1) return res.redirect('/board');

    var viewCount = 5;

    var paging = viewCount * (req.params.page - 1);

    boards.find({})
          .skip( paging )
          .limit(viewCount)
          .sort({"seq" : -1})
          .select('seq title writer day')
          .exec( (find_err, data) => {
                 boards.count({}, ( count_err ,count ) => {
                  res.render('board.ejs', {posts : data,  totalCount : count } );
                }) 
    });
});*/

router.get('/post/write', Logged_in, (req, res) => {
    res.render('write.ejs');
})

router.post('/write', Logged_in, async (req, res) => { // title, eiditData
   if(req.body.title == "" || req.body.editordata == "") return;

  /* var first_pos = req.body.editordata.indexOf("img\\"); //img 폴더에 저장하는 첫번째 이미지의 시작
   var last_pos = req.body.editordata.indexOf("\"", first_pos + 4 ); // 저장하는 이미지의 끝

   var first_img = req.body.editordata.substring( first_pos + 4, last_pos ); //이미지 이름만 추출

   //로그인이 요구되기 때문에 파일명을 시간 + 유저 + 이미지 이름 이런 식으로 만들어서 저장하는것도 좋을듯. 
   //파일을 찾는 시간도 고려되기 때문에 나중에는 일별로 폴더를 생성하고 집어넣는걸로 개선.*/

   var board = {
       title : req.body.title,
       content : req.body.editordata,
       writer: req.user,
       day: moment().format("YYYY-MM-DD HH:mm:ss")
   };

   posts.create(board).then( (board) => {
       postCount.findOneAndUpdate({}, {$inc : { 'count' : 1 }}, {new : true} ).exec( (err, response) => {
         if(err) return boards.deleteOne({ 'seq' : board.seq });
         console.log("save success");
         res.redirect('/board');
       });
   }).catch( (err) => {
       console.log(err);
   })


  /* var data_t = [ '안녕하세요', '감사합니다', '안녕히계세요', '신고합니다', '좋은하루' ];
   var data_c = [ '오늘 따라 되는게 없네요', '다음에 또 봅시다', '다들 좋은 하루 되시고 내일 만나요', '혹시 좋은 영화 추천 해주실 수 있나요 ?', '오늘 가입했습니다 잘 부탁드립니다'];
   var number = Math.random();    



   for(var i = 0; i < 10000; ++i){
     let board = {
        title : data_t[getRandomInt(5)],
        content : data_c[getRandomInt(5)],
        writer: req.user,
        day: moment().format("YYYY-MM-DD HH:mm:ss")
       };

       boards.create(board).then( (board) => {
        postCount.findOneAndUpdate({}, {$inc : { 'count' : 1 }}, {new : true} ).exec( (err, response) => {
          if(err) return boards.deleteOne({ 'seq' : board.seq }); // count inc err -> insert board(seq) delete 
          console.log("save success");
        });
    }).catch( (err) => {
        console.log(err);
    })
   }*/
   

})

function getRandomInt(num) { //min ~ max 사이의 임의의 정수 반환
    return Math.floor(Math.random() * num );
}


router.post('/write/img', Logged_in, upload.single('img'), (req, res) => { //multer로 이미지를 저장
    var imgurl = '';

    if(req.file != null) {
       imgurl = "/"+req.file.path; // 이미지 파일의 경로
    }

    res.json(imgurl);
});


router.get('/post/visited', (req, res) => {
   
    posts.findOne({ seq: req.query.pid }, async (err, posts_result) => {
        if (err) return console.log(err);

        if (req.cookies[req.query.pid] == undefined) {
            res.cookie( "visited_" +req.query.pid, getIP(req), {
                maxAge: 720000
            })
            await posts.updateOne({ seq: req.query.pid }, { $inc: { 'views': 1 } });
        }

        comments.find({ post_id: req.query.pid })
                .limit(COMMNET_VIEW_COUNT)
                .exec( (err, comments_res ) => {
                        comments.find({ post_id : req.query.pid }).count().exec((count_err, count_res ) =>{
                            res.render('post.ejs', { post: posts_result, comment: comments_res, totalCount : count_res });
                        })
                      })
        })
});

//comment insert
router.post('/post/comment', Logged_in, (req, res) => {
    var comment = {
        post_id : req.body.post_id,
        content : req.body.content,
        user : req.user,
        day : moment().format("YYYY-MM-DD HH:mm:ss")
    }
    comments.create(comment).then( () => {
        console.log("save success");
        res.send('success');
    }).catch( (err) => {
        console.log(err);
    })
})

router.get('/post/comment', (req, res) => { 

    comments.find({ post_id : req.query.pid })
    .skip( (req.query.page - 1 ) * COMMNET_VIEW_COUNT)
    .limit(COMMNET_VIEW_COUNT)
    .exec( (err, comments_res ) => { 
        comments.find({ post_id : req.query.pid })
                .count()
                .exec( ( count_err, count_res ) => {
                    res.send({ comment : comments_res, totalCount : count_res });
                })
          })

})

router.get('/search/post', (req, res) => {
    const SEARCH_LIMIT_NUMBER = 30000;
    const VIEW_COUNT = 5; //페이지 당 보여줄 검색 결과의 갯수.
    var n = 0;

    if (req.query.snx != undefined) n = req.query.snx; //다음검색


    switch (req.query.smt) {
        case '1':  //1 - title
            posts.findOne().sort({ 'seq': -1 }).exec((seq_err, last_post) => {
                if (seq_err) return console.log(seq_err);

                posts.find({ title: { $regex: '.*' + req.query.stx } })
                    .gte('seq', last_post.seq - (SEARCH_LIMIT_NUMBER * (n + 1)))  //  gte => , lt < 
                    .lt('seq', last_post.seq - (SEARCH_LIMIT_NUMBER * (n)))
                    .skip(VIEW_COUNT * (req.query.page - 1))
                    .limit(VIEW_COUNT)
                    .exec((err, search_result) => {
                        if (err) return err;

                        posts.find({ title: { $regex: '.*' + req.query.stx } })
                            .gte('seq', last_post.seq - (SEARCH_LIMIT_NUMBER * (n + 1)))  //  gte => , lt < 
                            .lt('seq', last_post.seq - (SEARCH_LIMIT_NUMBER * (n)))
                            .count()
                            .exec((err, search_count) => {
                                res.render("search.ejs", { posts: search_result, totalCount: search_count });
                            });
                    });
            })

            break;
        case '2':  //2 - content 
            posts.findOne().sort({ 'seq': -1 }).exec((seq_err, last_post) => {
                if (seq_err) return console.log(seq_err);


                posts.find({ content: { $regex: '.*' + req.query.stx } })
                    .gte('seq', last_post.seq - (SEARCH_LIMIT_NUMBER * (n + 1)))  //  gte => , lt < 
                    .lt('seq', last_post.seq - (SEARCH_LIMIT_NUMBER * (n)))
                    .skip(VIEW_COUNT * (req.query.page - 1))
                    .limit(VIEW_COUNT)
                    .exec((err, search_result) => {
                        if (err) return err;

                        posts.find({ title: { $regex: '.*' + req.query.stx } })
                            .gte('seq', last_post.seq - (SEARCH_LIMIT_NUMBER * (n + 1)))  //  gte => , lt < 
                            .lt('seq', last_post.seq - (SEARCH_LIMIT_NUMBER * (n)))
                            .count()
                            .exec((err, search_count) => {
                                res.render("search.ejs", { posts: search_result, totalCount: search_count });
                            });

                    });
            })
            break;
        case '3':  //3 - title + content
            posts.findOne().sort({ 'seq': -1 }).exec((seq_err, last_post) => {
                if (seq_err) return console.log(seq_err);

                posts.find({})
                    .or([{ title: { $regex: '.*' + req.query.stx } }, { content: { $regex: '.*' + req.query.stx } }])
                    .gte('seq', last_post.seq - (SEARCH_LIMIT_NUMBER * (n + 1)))  //  gte => , lt < 
                    .lt('seq', last_post.seq - (SEARCH_LIMIT_NUMBER * (n)))
                    .skip(VIEW_COUNT * (req.query.page - 1))
                    .limit(VIEW_COUNT)
                    .exec((err, search_result) => {
                        if (err) return err;

                        posts.find({ title: { $regex: '.*' + req.query.stx } })
                            .gte('seq', last_post.seq - (SEARCH_LIMIT_NUMBER * (n + 1)))  //  gte => , lt < 
                            .lt('seq', last_post.seq - (SEARCH_LIMIT_NUMBER * (n)))
                            .count()
                            .exec((err, search_count) => {
                                res.render("search.ejs", { posts: search_result, totalCount: search_count });
                            });
                    });
            });
    }

});

module.exports = router;