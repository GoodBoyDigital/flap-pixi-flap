 // create an new instance of a pixi stage
   
    /*
    
    Steve

    */
    var Steve = function()
    {
        PIXI.Sprite.call(this, PIXI.Texture.fromImage('assets/flyingPixie.png'));
        
        this.anchor.set(0.5);

        this.speed = new PIXI.Point();
        this.gravity = 0.4;

        this.maxSpeed = 10;

        this.position.x = 240;

        this.spinSpeed = 0;
    }

    Steve.prototype = Object.create( PIXI.Sprite.prototype );

    Steve.prototype.update = function()
    {
        this.speed.y += this.gravity;
        
        this.speed.y = Math.min(this.speed.y, this.maxSpeed);
        this.speed.y = Math.max(this.speed.y, -this.maxSpeed);

        this.position.y += this.speed.y;
        this.rotation += this.spinSpeed;
    }

    Steve.prototype.flap = function()
    {
         this.speed.y -= 15;
    }

    Steve.prototype.hit = function()
    {
         this.speed.y -= 15;
         this.spinSpeed = 0.1;
    }

    Steve.prototype.reset = function()
    {
        this.position.y = 200;
        this.speed.y = 0;
        this.spinSpeed = 0;
        this.rotation = 0;
    }
     /*
    
    Pipe

    */
    var Pipe = function( entryPoint, maxHeight, minHeight )
    {
        PIXI.DisplayObjectContainer.call(this)

        this.entryPoint = entryPoint;

        this.maxHeight = maxHeight;
        this.minHeight = minHeight;

        this.gapSize = 300;

        this.topPipe = PIXI.Sprite.fromImage('assets/column.png');

        this.bottomPipe = PIXI.Sprite.fromImage('assets/column.png');
        
        this.addChild(this.topPipe);
        this.addChild(this.bottomPipe);

        this.adjustGapPosition();
    }

    Pipe.prototype = Object.create( PIXI.DisplayObjectContainer.prototype );

    Pipe.prototype.update = function( speedX )
    {
        this.position.x -= speedX;
        if(this.position.x < -200)
        {
            this.position.x += this.entryPoint;
            this.adjustGapPosition();
        }
    }

    Pipe.prototype.adjustGapPosition = function()
    {   
        this.gapPosition = this.minHeight + ( Math.random() * (this.maxHeight - this.minHeight) ) ;
     
        this.topPipe.position.y =  this.gapPosition - this.gapSize/2 - this.topPipe.height;
        this.bottomPipe.position.y =  this.gapPosition + this.gapSize/2;
    }

    /*
    
    GAME

    */
    var Game = function()
    {
        this.width = 1286;
        this.height = 640;
        this.gameSpeed = 5;
        this.pipes = [];
        this.state = 'playing';

        this.initPixi();
        this.initPipes();

        this.stage.mousedown = this.stage.touchstart = this.onClicked.bind(this);

        this.steve = new Steve();
        this.stage.addChild(this.steve);

        this.reset();      

        requestAnimationFrame(this.update.bind(this));
    }

    Game.prototype.initPixi = function() 
    {
        this.stage = new PIXI.Stage(0x66FF99);
        this.renderer = PIXI.autoDetectRenderer(this.width, this.height);

        // add the renderer view element to the DOM
        document.body.appendChild(this.renderer.view);

        this.background = new PIXI.TilingSprite(PIXI.Texture.fromImage('assets/mainBG.jpg'), this.width, this.height);
        this.stage.addChild(this.background);
        
        this.stage.interactive = true;
        this.stage.hitArea = new PIXI.Rectangle(0, 0, this.width, this.height);
    }


    Game.prototype.initPipes = function() 
    {
        var pipeWidth = 139;
        var pipeGap = 200;
        var totalPipes = 8;

       var size = (pipeWidth + pipeGap) * totalPipes;

       for (var i = 0; i < totalPipes; i++) 
        {    
            var pipe = new Pipe( size, 200, this.height - 200 );
            this.stage.addChild(pipe);
            this.pipes.push(pipe);
        };
    }


    Game.prototype.update = function() 
    {
        requestAnimationFrame(this.update.bind(this));

        this.steve.update();

        if(this.state === 'playing')
        {
            this.background.tilePosition.x -= this.gameSpeed * 0.6;
            
            this.steve.alpha = 1;

            for (var i = 0; i < this.pipes.length; i++)
            {
                var pipe = this.pipes[i];

                pipe.update( this.gameSpeed );
                
                var hit = this.hitTestPipe(pipe);

                if(hit)
                {
                    this.gameover();
                    break;
                }

            };

            if(this.steve.position.y > this.height)
            {
                this.gameover();
            }
        }


        // render the stage
        this.renderer.render(this.stage);
    }

    Game.prototype.hitTestPipe = function( pipe )
    {   
        var playerHitArea = this.steve;

        if( playerHitArea.x + playerHitArea.width/2 > pipe.position.x && 
            playerHitArea.x - playerHitArea.width/2 < pipe.position.x + pipe.width)
        {
            //player is crossing a pipe now check to see if he is in the gap
            if( playerHitArea.y - playerHitArea.height/2 > pipe.topPipe.position.y + pipe.topPipe.height && 
                playerHitArea.y + playerHitArea.height/2 < pipe.bottomPipe.position.y)
            {
                // safe!
            }
            else
            {
                return true;
            }
        }

        return false;
    }


    Game.prototype.gameover = function()
    {
        this.state = 'gameover';
        this.steve.hit();
    }


    Game.prototype.reset = function()
    {
        this.state = 'playing';

        var pipeWidth = 139;
        var pipeGap = 200;
        var totalPipes = this.pipes.length;

        for (var i = 0; i < totalPipes; i++) 
        {
            var pipe = this.pipes[i];
            pipe.position.x = ((pipeWidth + pipeGap) * i) + 800;
            pipe.adjustGapPosition();
        };

        this.steve.reset();
    }

    Game.prototype.onClicked = function()
    {
        if(this.state === 'playing')
        {
            this.steve.flap();
        }
        else
        {
            this.reset();
        }
    }

    var loader = new PIXI.AssetLoader([
        'assets/mainBG.jpg',
        'assets/column.png',
        'assets/flyingPixie.png'
    ]);

    loader.onComplete = function(){
        var game = new Game();        
    }

    loader.load();

    
