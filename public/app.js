$(document).ready(function(){

	// Default variables
	var articleList = [];
	var articleId = '';
	var article = '';
	var previousArticle = 0;
	var currentArticle = 0;
	var nextArticle = 0;	

	// bring over Article from models file
	var Article = require('./models/news');

	$('#comments').addClass('hidden');

	// Scrape website on initial page load
	$.getJSON('/scrape', function(){
	});

	// Get all articles when read articles button clicked and build an array of articles
	$(document).on('click','#getArticles', function(){
		$.getJSON('/articles', function(data){

			for (let i=0; i<4; i++) {

				var title = data[i].title; // declare variable "title" and pass data[i].title to that variable

				$("#title").append(`<p>${title}</p>`); // append each title to the DOM in html with div called "title"

			}

		Article.findOne({'title':''}, function (err, res) {
  			if (err) return handleError(err);
  			console.log(res); 
			});

			});
	});

	// Display previous article from the array of articles
	$(document).on('click','.previous', function(){
		article = articleList[previousArticle];
		currentArticle = previousArticle;
		showArticle(article);
	}); 

	// Display next article from the array of articles
	$(document).on('click','.next', function(){
		article = articleList[nextArticle];
		currentArticle = nextArticle;
		showArticle(article);
	}); 

	// Add comment to article and update comments display
	$(document).on('click','#addComment', function(){
		if($('#commentText').val() != '') {
			var name = $('#name').val();
			var comment = $('#commentText').val();

			$.post("/comments/" + articleId, {name: name, note: comment}, function(e) {
				e.preventDefault();
			});
			$('#name').val('');
			$('#commentText').val('');
			showComments(articleId);


		}
	});	
	
	// Delete comment from article and update comments display
	$(document).on('click','.deletecomment', function(){
		commentId = this.id;
		// console.log("comment id "+ commentId);
		$.ajax({
			method: "GET",
			url:"/deletecomment/" + commentId
		}).done(function(data){
		})
		showComments(articleId);
	});		

	// Function to build article display
	var showArticle = function(article) {
		$('#title').text(article.title);
		$("#image").removeClass("hidden");
		$('#image').attr('src', article.imgLink);
		$('#summary').text(article.summary);
		$("#readArticle").removeClass("hidden");
		$('#article').attr('href', article.storyLink);
		$("#getArticles").addClass("hidden");
		$("#navigation").empty();
		previousArticle = currentArticle - 1;
		if(previousArticle >= 0) {
			$('#navigation').append('<button id="'+previousArticle+'" class="btn btn-primary previous">Previous Article</button>');
		} else {
			$('#navigation').append('<button id="'+previousArticle+'" class="btn btn-primary disabled previous">Previous Article</button>');
		}
		nextArticle = currentArticle + 1;
		if(nextArticle < articleList.length) {
			$('#navigation').append('<button id="'+nextArticle+'" class="btn btn-primary pull-right next">Next Article</button>');
		} else {
			$('#navigation').append('<button id="'+nextArticle+'" class="btn btn-primary pull-right disabled next">Next Article</button>');
		}
		articleId = article._id;
		showComments(articleId);
	}

	// Function to build comments display for article
	var showComments = function(articleId) {
		$("#comments").removeClass("hidden");
		// $("#articleComments").empty();
		var commentText = '';
		$.getJSON('/comments/'+articleId, function(data){
			for(var i = 0; i < data.length; i++){
				commentText = commentText + '<div class="well"><span id="'+data[i]._id+'" class="glyphicon glyphicon-remove text-danger deletecomment"></span> '+data[i].comment+' - '+data[i].name+'</div>';
			}
			$("#articleComments").append(commentText);
		});
	}

});