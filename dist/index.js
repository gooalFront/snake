// snake
// 默认分成40*40
var Snake = /** @class */ (function () {
    function Snake(config) {
        this.config = config;
        this.VERSION = "0.0.1";
        this.rectCount = 40;
        this.bornPos = [0, 0];
        this.gameover = false;
        this.area = config['area'];
        this.areaColor = config['areaColor'] || 'black';
        this.initLength = config['initLength'] || 3;
        this.initSpeed = config['initSpeed'] || 100;
        this.color = config['color'] || 'red';
        if (!this.area.length)
            throw new Error('no area info');
        // 分层canvas
        var canvasBg = document.createElement('canvas');
        var canvasBornPoint = document.createElement('canvas');
        var canvasSnake = document.createElement('canvas');
        this.areaObj = document.querySelector(this.area);
        this._applyStyles(canvasBg, 1);
        this._applyStyles(canvasBornPoint, 2);
        this._applyStyles(canvasSnake, 3);
        this.areaObj.style.position = 'relative';
        this.areaObj.appendChild(canvasBg);
        this.areaObj.appendChild(canvasBornPoint);
        this.areaObj.appendChild(canvasSnake);
        this.rect = {
            "width": (this.areaObj.getAttribute('width') / this.rectCount) || (this.areaObj.offsetWidth / this.rectCount),
            "height": (this.areaObj.getAttribute('height') / this.rectCount) || (this.areaObj.offsetHeight / this.rectCount)
        };
        this.bgPen = canvasBg.getContext('2d');
        this.bornPen = canvasBornPoint.getContext('2d');
        this.snakePen = canvasSnake.getContext('2d');
        // init map
        this.drawArea();
        // 生成蛇🐍的位置
        this._generaSnakePos();
        this._snakeDirect();
        // 画蛇的位置
        this.drawSnake();
        // 生成食物位置
        this._generaFootPos();
        // 画食物
        this.drawFood();
        // 添加上下左右
        this.addWindowControl();
    }
    Snake.prototype.drawArea = function () {
        for (var i = 0; i < this.rectCount; i++) {
            for (var j = 0; j < this.rectCount; j++) {
                this.bgPen.fillStyle = "#fff";
                this.bgPen.strokeStyle = "#000";
                this.bgPen.strokeRect(i * this.rect['width'], j * this.rect['height'], this.rect['width'], this.rect['height']);
                this.bgPen.fillRect(i * this.rect['width'], j * this.rect['height'], this.rect['width'], this.rect['height']);
            }
        }
        return this;
    };
    Snake.prototype.drawFood = function () {
        // setInterval(() => {
        this.bornPen.fillStyle = "green";
        this.bornPen.strokeStyle = "green";
        this.bornPen.strokeRect(this.bornPos[0] * this.rect['width'], this.bornPos[1] * this.rect['height'], this.rect['width'], this.rect['height']);
        this.bornPen.fillRect(this.bornPos[0] * this.rect['width'], this.bornPos[1] * this.rect['height'], this.rect['width'], this.rect['height']);
        // setTimeout(() => {
        //     this.bornPen.fillStyle = "#fff";
        //     this.bornPen.strokeStyle = "#000";
        //     this.bornPen.strokeRect(this.bornPos[0] * this.rect['width'], this.bornPos[1] * this.rect['height'], this.rect['width'], this.rect['height']);
        //     this.bornPen.fillRect(this.bornPos[0] * this.rect['width'], this.bornPos[1] * this.rect['height'], this.rect['width'], this.rect['height']);
        // }, 150)
        // }, 300)
    };
    // 画蛇
    Snake.prototype.drawSnake = function () {
        var _this = this;
        if (this.gameover) {
            console.log('gameover');
            return;
        }
        ;
        this.snakePen.clearRect(0, 0, this.areaObj.offsetWidth, this.areaObj.offsetHeight);
        for (var i = 0; i < this.snakePos.length; i++) {
            this.snakePen.fillStyle = "red";
            this.snakePen.strokeStyle = "#fff";
            this.snakePen.strokeRect(this.snakePos[i][0] * this.rect['width'], this.snakePos[i][1] * this.rect['height'], this.rect['width'], this.rect['height']);
            this.snakePen.fillRect(this.snakePos[i][0] * this.rect['width'], this.snakePos[i][1] * this.rect['height'], this.rect['width'], this.rect['height']);
        }
        var flag = 0;
        var timer = setTimeout(function () {
            _this._nextPosByDirective();
            _this.drawSnake();
        }, this.initSpeed);
    };
    // 生成蛇的位置
    Snake.prototype._generaSnakePos = function () {
        var _self = this;
        var start = Math.round(this.rectCount / 3);
        var end = Math.round(this.rectCount / 3 * 2);
        var headPos, direct, bodyPos;
        headPos = _self._generaLocationPos(start, end);
        // 根据headPos 生成蛇身体的位置
        direct = _self._snakeDirect();
        bodyPos = _self._generaSnakePosByDirect(direct, headPos);
        _self.snakePos = [headPos].concat(bodyPos);
        this.directive = direct;
    };
    // 根据方向计算下一步位置
    Snake.prototype._nextPosByDirective = function () {
        if (this._isEquals(this.bornPos, this.snakePos[0])) {
            this.snakePos.push(this.bornPos.concat());
            this.bornPen.clearRect(0, 0, this.areaObj.offsetWidth, this.areaObj.offsetWidth);
            this._generaFootPos();
            this.drawFood();
        }
        var body = this.snakePos.slice(0, this.snakePos.length - 1).concat();
        var headPos = this.snakePos.slice(0, 1)[0].concat();
        switch (this.directive) {
            case 'up':
                if (headPos[1] == 0)
                    this.gameover = true;
                headPos[1]--;
                break;
            case 'down':
                if (headPos[1] == this.rectCount - 1)
                    this.gameover = true;
                headPos[1]++;
                break;
            case 'left':
                if (headPos[0] == 0)
                    this.gameover = true;
                headPos[0]--;
                break;
            case 'right':
                if (headPos[0] == this.rectCount - 1)
                    this.gameover = true;
                headPos[0]++;
                break;
        }
        this.snakePos = [headPos].concat(body);
    };
    // 生成食物位置
    Snake.prototype._generaFootPos = function () {
        var _this = this;
        var location, flag = false;
        var a = function () {
            location = _this._generaLocationPos(1, _this.rectCount);
            // 避开蛇的位置
            for (var i = 0; i < _this.snakePos.length; i++) {
                if (_this._isEquals(_this.snakePos[i], location)) {
                    flag = true;
                    break;
                }
            }
            flag = false;
        };
        do {
            a();
        } while (flag);
        this.bornPos = location.concat();
    };
    // 根据方向生成蛇身体位置
    Snake.prototype._generaSnakePosByDirect = function (direct, headPos) {
        var countSortList = [];
        for (var i = 1; i < this.initLength; i++) {
            countSortList.push(i);
        }
        var bodyPos = [];
        switch (direct) {
            case 'up':
                countSortList.forEach(function (val, index) {
                    bodyPos.push([headPos[0], headPos[1] + val]);
                });
                break;
            case 'down':
                countSortList.forEach(function (val, index) {
                    bodyPos.push([headPos[0], headPos[1] - val]);
                });
                break;
            case 'left':
                countSortList.forEach(function (val, index) {
                    bodyPos.push([headPos[0] + val, headPos[1]]);
                });
                break;
            case 'right':
                countSortList.forEach(function (val, index) {
                    bodyPos.push([headPos[0] - val, headPos[1]]);
                });
                break;
        }
        return bodyPos;
    };
    // 生成蛇初始化方向
    Snake.prototype._snakeDirect = function () {
        // 1  2  3  4  上下左右
        var flag;
        switch (this._generaNumber(1, 4)) {
            case 1:
                flag = 'up';
                break;
            case 2:
                flag = 'down';
                break;
            case 3:
                flag = 'left';
                break;
            default:
                flag = 'right';
        }
        return flag;
    };
    Snake.prototype._generaLocationPos = function (start, end) {
        return [this._generaNumber(start, end), this._generaNumber(start, end)];
    };
    Snake.prototype._generaNumber = function (n, m) {
        return Math.round(Math.random() * (m - n) + n);
    };
    Snake.prototype._applyStyles = function (dom, index) {
        dom.style.position = 'absolute';
        dom.style.left = 0;
        dom.style.right = 0;
        dom.setAttribute('width', this.areaObj.offsetWidth);
        dom.setAttribute('height', this.areaObj.offsetHeight);
        // dom.style.background = 'transparent';
        dom.style.zIndex = index + 1;
        if (index == 1)
            dom.style.border = "1px solid #000";
    };
    Snake.prototype.addWindowControl = function () {
        var _this = this;
        document.addEventListener('keyup', function (ev) {
            // 38 40 37 39
            switch (ev.keyCode) {
                case 38:
                    if (_this.directive == 'up' || _this.directive == 'down')
                        return;
                    _this.directive = 'up';
                    break;
                case 40:
                    if (_this.directive == 'up' || _this.directive == 'down')
                        return;
                    _this.directive = 'down';
                    break;
                case 37:
                    if (_this.directive == 'left' || _this.directive == 'right')
                        return;
                    _this.directive = 'left';
                    break;
                case 39:
                    if (_this.directive == 'left' || _this.directive == 'right')
                        return;
                    _this.directive = 'right';
                    break;
            }
        }, false);
    };
    Snake.prototype._isEmptyObject = function (object) {
        return JSON.stringify(object) === '{}';
    };
    Snake.prototype._isEquals = function (srcArr, targetArr) {
        return srcArr.join(',') == targetArr.join(',');
    };
    Snake.prototype._trim = function (str) {
        return str.replace(/\s/g, '');
    };
    return Snake;
}());
//# sourceMappingURL=index.js.map