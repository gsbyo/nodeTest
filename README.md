# Node.js ( Mongoose ) / EJS 로 만든 게시판 입니다.

구조
<br>
<br>config
 - db
 - multer (이미지 업로드)
 - passport (로그인)
 
<br>schema
 - post
 - postCount
 - comment
 - user 
 
<br>router
 - login.js
 - board.js
 
<br>views
  - *.ejs
 

------------------------------------------------------------------------------------------------------------------

로그인의 경우 일반 로그인 / 네이버 로그인 으로 구현. <br>
아직 회원가입은 구현되지 않음.

![로그인전략](https://user-images.githubusercontent.com/82531576/169318032-6743b9b2-5d92-4e5c-8e78-6c010a9f6ca8.PNG)

게시판의 페이징은 전체 게시물의 count를 빠르게 하기 위해서 전체 게시물의 갯수를 카운트하는 테이블이 존재하며, <br>
게시물이 작성될때 마다 1 씩 update를 하고 있음. <br>                                                                        

![게시판 페이징](https://user-images.githubusercontent.com/82531576/169319185-4ab38560-22fe-4b29-a90c-63b72c1e6a7a.PNG)

![게시판 작성](https://user-images.githubusercontent.com/82531576/169319226-d0416ac4-b900-4659-a76a-73cc74a511cd.PNG)

검색의 페이징의 경우 마지막으로 작성 된 게시물의 번호와 한정된 범위에서의 검색된 결과와 그 갯수를 가져오기 때문에 <br> 총 3개의 쿼리가 실행 됨.
<br>범위가 정해져 있기 때문에 느리진 않지만 테이블의 끝까지 한번에 검색을 요구하거나 범위가 늘어날 경우 <br> count의 쿼리를 개선 시킬 필요가 있어보임.
( 게시글과 댓글은 seq (번호) 의 역순을 기준으로 index가 만들어져 있음. )

![검색 쿼리](https://user-images.githubusercontent.com/82531576/169320362-bb8da016-b656-478e-8979-fcb82472eb5f.PNG)

조회수는 로그인을 하지않더라도 게시글을 볼 수 있기 때문에 ip와 cookie-paser를 활용하여 구현하였음.

![getip](https://user-images.githubusercontent.com/82531576/169321784-2d773a22-95f9-4c9f-925a-f865bc5661c3.PNG)

![조회수](https://user-images.githubusercontent.com/82531576/169321763-c90f31d3-e552-4f1f-8de4-22a06afdb001.PNG)

글쓰기는 summernote editor를 사용하였으며, 게시글에 사진을 올리는 동시에 multer (업로드 라이브러리) 가 지정 된 경로에 이미지를 저장을 한 후 다시
입력창에 사진을 띄움. 만약 입력창에서 글쓰기를 완료하지 않거나 사진을 지운 경우에도 사진이 이미 업로드가 됨. ( 개선사항 )

보안은 helmet 라이브러리를 사용하였으며 현재 csp를 false로 하고 그 외에는 defalut로 설정되어 있음.

![defalut](https://user-images.githubusercontent.com/82531576/169322401-3b8b54d3-857c-4a36-9de3-75e93918b4a8.PNG)

게시판의 경우 사용자의 입력이 많기 때문에 xss 공격에 노출이 되는데
글쓰기는 summernote editor에서 <br>입력 된 값이 db에 저장될 때 xss필터를 한번 거쳐서 저장됨 <br>
댓글은 필터를 거치지 않고 저장되는데, ejs에서 넘어온 값이 <%= 댓글 %> 이렇게 들어오는데 이 경우에는 html escape가 필터링을 함.
<br>sql injection의 경우 mongoose의 쿼리 빌더를 사용을 하여 악용 사용자의 입력값을 방어 할 수 있음.
