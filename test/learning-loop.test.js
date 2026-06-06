const test = require("node:test");
const assert = require("node:assert/strict");
const LearningLoopService = require("../src/core/LearningLoopService");

test("learning loop mastery starts from diagnostic evidence", () => {
    const service = new LearningLoopService({});
    assert.equal(service.calculateMastery(0), 20);
    assert.equal(service.calculateMastery(100), 85);
    assert.equal(service.calculateMastery(60), 59);
});

test("learning loop creates three staged days from user mastery", () => {
    const service = new LearningLoopService({});
    const days = service.buildPlanDays({
        knowledge: { id: 26, title: "TCP/IP协议族", subject: "计算机网络" },
        mastery: 35,
        durationDays: 3
    });
    assert.equal(days.length, 3);
    assert.match(days[0].title, /建立概念地图/);
    assert.match(days[1].title, /基础例题与诊断纠错/);
    assert.match(days[2].title, /主动回忆与复述/);
});

test("learning loop advances plan shape when mastery is high", () => {
    const service = new LearningLoopService({});
    const [day] = service.buildPlanDays({
        knowledge: { id: 26, title: "TCP/IP协议族", subject: "计算机网络" },
        mastery: 82,
        durationDays: 1
    });
    assert.match(day.title, /边界条件与故障分析/);
});
