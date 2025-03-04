import { gameOver, gameRestart } from "../script.js";
export class Start extends Phaser.Scene {
  constructor() {
    super("Start");
    this.playerHealth = 100;
    this.enemyHealth = 100;
  }

  preload() {
    this.load.image("background", "assets/Background.png");

    // Player assets
    this.load.spritesheet("RUN", "assets/RUN.png", {
      frameWidth: 96,
      frameHeight: 96,
    });
    this.load.spritesheet("IDLE", "assets/IDLE.png", {
      frameWidth: 96,
      frameHeight: 96,
    });
    this.load.spritesheet("HURT", "assets/HURT.png", {
      frameWidth: 96,
      frameHeight: 96,
    });
    this.load.spritesheet("ATTACK", "assets/ATTACK.png", {
      frameWidth: 96,
      frameHeight: 96,
    });

    //health

    // Enemy assets (Guardian)
    this.load.spritesheet("ENEMY_RUN", "assets/Guardian-Walk.png", {
      frameWidth: 96,
      frameHeight: 96,
    });
    this.load.spritesheet("ENEMY_IDLE", "assets/Guardian-Idle.png", {
      frameWidth: 96,
      frameHeight: 96,
    });
    this.load.spritesheet("ENEMY_HURT", "assets/Guardian-Hurt.png", {
      frameWidth: 96,
      frameHeight: 96,
    });
    this.load.spritesheet("ENEMY_ATTACK", "assets/Guardian-Attack.png", {
      frameWidth: 96,
      frameHeight: 96,
    });
    this.load.spritesheet("ENEMY_DEATH", "assets/Guardian-Death.png", {
      frameWidth: 96,
      frameHeight: 96,
    });

    // Load background music
    this.load.audio("backgroundMusic", "assets/music.ogg");
  }

  create() {
    this.background = this.add
      .tileSprite(0, 0, 1980, 780, "background")
      .setOrigin(0, 0);

    // Play background music
    this.backgroundMusic = this.sound.add("backgroundMusic", {
      loop: true,
      volume: 0.5,
    });
    this.backgroundMusic.play();

    // Health UI
    this.playerHealthText = this.add.text(50, 20, "Player Health: 100", {
      fontSize: "24px",
      fill: "#fff",
      fontFamily: "Arial",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      padding: { left: 10, right: 10, top: 5, bottom: 5 },
    });

    this.enemyHealthText = this.add.text(1100, 20, "Enemy Health: 100", {
      fontSize: "24px",
      fill: "#fff",
      fontFamily: "Arial",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      padding: { left: 10, right: 10, top: 5, bottom: 5 },
    });

    // Player setup
    this.player = this.physics.add.sprite(700, 630);
    this.player.setCollideWorldBounds(true).setScale(3);
    this.player.body.setGravityY(1000);
    this.player.setData("health", 100);

    // Enemy setup
    this.enemy = this.physics.add.sprite(1100, 630);
    this.enemy.setCollideWorldBounds(false).setScale(4);
    this.enemy.body.setGravityY(1000);
    this.enemy.setData("health", 100);
    this.enemy.setData("hits", 0);

    // Ground
    this.ground = this.physics.add.staticGroup();
    this.ground.create(400, 600, null).setScale(100, 0.1).refreshBody();
    this.ground.setVisible(false);
    this.physics.add.collider(this.player, this.ground);
    this.physics.add.collider(this.enemy, this.ground);

    // Player animations
    this.createAnimations(
      this.player,
      "player",
      "RUN",
      "IDLE",
      "ATTACK",
      "HURT"
    );

    // Enemy animations
    this.createAnimations(
      this.enemy,
      "enemy",
      "ENEMY_RUN",
      "ENEMY_IDLE",
      "ENEMY_ATTACK",
      "ENEMY_DEATH",
      "ENEMY_HURT"
    );

    this.player.play("player_idle");
    this.enemy.play("enemy_idle");

    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );
  }

  createAnimations(character, prefix, runKey, idleKey, attackKey, hurtKey) {
    character.anims.create({
      key: `${prefix}_idle`,
      frames: this.anims.generateFrameNumbers(idleKey, { start: 0, end: 9 }),
      frameRate: 14,
      repeat: -1,
    });

    character.anims.create({
      key: `${prefix}_running`,
      frames: this.anims.generateFrameNumbers(runKey, { start: 0, end: 15 }),
      frameRate: 20,
      repeat: -1,
    });

    character.anims.create({
      key: `${prefix}_attack`,
      frames: this.anims.generateFrameNumbers(attackKey, { start: 0, end: 5 }),
      frameRate: 20,
      repeat: 0, // Attack should play once
    });

    character.anims.create({
      key: `${prefix}_hurt`,
      frames: this.anims.generateFrameNumbers(hurtKey, { start: 0, end: 3 }),
      frameRate: 10,
      repeat: 0, // Hurt animation should also play once
    });

    if (prefix === "enemy") {
      character.anims.create({
        key: `${prefix}_death`,
        frames: this.anims.generateFrameNumbers("ENEMY_DEATH", {
          start: 0,
          end: 5,
        }),
        frameRate: 10,
        repeat: 0,
      });
    }
    this.screenWidth = this.sys.game.config.width;
  }

  update() {
    let BackgroundMovingDir = 0;
    let isBackgroundMoving = false;
    let backgroundShiftAmount = 0;

    // **PLAYER ATTACKS ENEMY**
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.player.play("player_attack", true);

      if (
        this.enemy &&
        this.enemy.getData("health") > 0 &&
        Phaser.Math.Distance.Between(
          this.player.x,
          this.player.y,
          this.enemy.x,
          this.enemy.y
        ) < 120
      ) {
        let health = this.enemy.getData("health");
        this.enemy.play("enemy_hurt");
        this.enemy.setData("hits", this.enemy.getData("hits") + 1);
        if (this.enemy.getData("hits") == 3) {
          health = health - 25 < 0 ? 0 : health - 25;
          this.enemy.setData("hits", 0);
        } else {
          health = health - 10 < 0 ? 0 : health - 10;
        }
        this.enemy.setData("health", health);

        this.enemyHealthText.setText(`Enemy Health: ${health}`);

        if (this.enemy.getData("health") <= 0) {
          this.enemy.play("enemy_death", true);
          this.enemy.setVelocityX(0);
          this.enemy.body.enable = false;

          this.enemy.on("animationcomplete", () => {
            if (this.enemy) {
              this.enemy.destroy();
              this.enemy = null;
            }
            // Spawn a new enemy after 5 seconds
            this.time.delayedCall(2000, this.spawnEnemy, [], this);
          });
        }
      } else if (this.enemy) {
        this.enemy.setData("hits", 0);
      }
    }

    const isOnGround = this.player.body.blocked.down;
    if (this.cursors.up.isDown && isOnGround) {
      this.player.setVelocityY(-400);
    }

    // **MOVE PLAYER & BACKGROUND**
    if (
      !this.player.anims.isPlaying ||
      this.player.anims.currentAnim.key !== "player_attack"
    ) {
      if (this.cursors.left.isDown) {
        this.player.setFlipX(true);
        this.player.play("player_running", true);
        this.player.setVelocityX(-200);

        if (this.player.x <= this.screenWidth * 0.2) {
          backgroundShiftAmount = 4;
          this.background.tilePositionX -= backgroundShiftAmount;
          this.player.setVelocityX(0);
          BackgroundMovingDir = 1;
          isBackgroundMoving = true;
        }
      } else if (this.cursors.right.isDown) {
        this.player.setFlipX(false);
        this.player.play("player_running", true);
        this.player.setVelocityX(200);

        if (this.player.x >= this.screenWidth * 0.6) {
          backgroundShiftAmount = 4;
          this.background.tilePositionX += backgroundShiftAmount;
          this.player.setVelocityX(0);
          BackgroundMovingDir = -1;
          isBackgroundMoving = true;
        }
      } else {
        this.player.play("player_idle", true);
        this.player.setVelocityX(0);
      }
    }

    // **ENEMY BEHAVIOR**

    if (this.enemy && this.enemy.getData("health") > 0) {
      const enemyMaxSight = 500;
      const enemyAttackRange = 50;
      const enemySpeed = 100;

      const distanceToPlayer = Phaser.Math.Distance.Between(
        this.enemy.x,
        this.enemy.y,
        this.player.x,
        this.player.y
      );

      if (isBackgroundMoving) {
        this.enemy.x += BackgroundMovingDir * backgroundShiftAmount;
      } else if (
        this.enemy &&
        this.enemy.getData("health") > 0 &&
        this.enemy.getData("health") <= 30 &&
        distanceToPlayer < 800
      ) {
        this.enemy.setVelocityX(this.enemy.x > 700 ? 180 : -180);
        this.enemy.play("enemy_running", true);
        return;
      } else if (
        distanceToPlayer > enemyAttackRange &&
        distanceToPlayer <= enemyMaxSight &&
        !this.enemy.getData("isAttacking")
      ) {
        // **Chase Player**
        if (this.enemy.x > this.player.x) {
          this.enemy.setFlipX(true);
          this.enemy.setVelocityX(-enemySpeed);
        } else {
          this.enemy.setFlipX(false);
          this.enemy.setVelocityX(enemySpeed);
        }
        this.enemy.play("enemy_running", true);
      } else if (
        this.player.getData("health") > 0 &&
        distanceToPlayer <= enemyAttackRange &&
        !this.enemy.getData("isAttacking")
      ) {
        // **Start Attack**
        this.enemy.setVelocityX(0);
        this.enemy.setData("isAttacking", true);
        this.enemy.play("enemy_attack", true);

        // **Apply damage only at a specific frame of the attack animation**
        this.enemy.once("animationupdate", (anim, frame) => {
          if (anim.key === "enemy_attack" && frame.index === 5) {
            // Adjust frame number to match actual attack moment
            if (this.player.getData("health") > 0) {
              this.player.setData("health", this.player.getData("health") - 4);
              this.playerHealthText.setText(
                `Player Health: ${this.player.getData("health")}`
              );
              this.player.play("player_hurt", true);

              if (this.player.getData("health") <= 0) {
                this.player.play("player_hurt");

                this.player.on("animationcomplete", () => {
                  this.player.destroy();
                });

                this.gameOverHandler();
              }
            }
          }
        });
      } else {
        // **Idle when not chasing or attacking**
        this.enemy.setVelocityX(0);
        if (!this.enemy.getData("isAttacking")) {
          this.enemy.play("enemy_idle", true);
        }
      }
      this.enemy.setData("isAttacking", false); // Reset attack flag
    }
  }

  gameOverHandler() {
    gameOver();
    this.input.keyboard.enabled = false;
    // Restart the scene after 5 seconds
    this.time.delayedCall(5000, () => {
      gameRestart();
      this.scene.restart();
      this.input.keyboard.enabled = true;
    });
  }

  spawnEnemy() {
    let spawnX = Phaser.Math.Between(this.player.x - 500, this.player.x + 500);
    spawnX = Phaser.Math.Clamp(spawnX, 100, this.screenWidth - 100); // Keep within screen bounds

    this.enemy = this.physics.add.sprite(spawnX, 630);
    this.enemy.setCollideWorldBounds(false).setScale(4);
    this.enemy.body.setGravityY(1000);
    this.enemy.setData("health", 100);
    this.enemyHealthText.setText(`Enemy Health: 100`);
    this.createAnimations(
      this.enemy,
      "enemy",
      "ENEMY_RUN",
      "ENEMY_IDLE",
      "ENEMY_ATTACK",
      "ENEMY_DEATH",
      "ENEMY_HURT"
    );

    this.physics.add.collider(this.enemy, this.ground);
    this.enemy.play("enemy_idle");
  }
}
