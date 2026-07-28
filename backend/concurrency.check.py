"""
Self-check: concurrent-use helpers (no Mongo required).
Run: backend/.venv/Scripts/python backend/concurrency.check.py
"""
import asyncio

AI_MAX = 3


async def _burst():
    sem = asyncio.Semaphore(AI_MAX)
    running = 0
    peak = 0

    async def job():
        nonlocal running, peak
        async with sem:
            running += 1
            peak = max(peak, running)
            await asyncio.sleep(0.05)
            running -= 1

    await asyncio.gather(*[job() for _ in range(12)])
    assert peak <= AI_MAX, f"peak {peak} > {AI_MAX}"
    assert peak == AI_MAX


async def _payout_lock_serializes():
    locks = {}
    guard = asyncio.Lock()
    order = []

    async def host_lock(host_id: str):
        async with guard:
            if host_id not in locks:
                locks[host_id] = asyncio.Lock()
            return locks[host_id]

    async def withdraw(n):
        lock = await host_lock("h1")
        async with lock:
            order.append(f"start-{n}")
            await asyncio.sleep(0.02)
            order.append(f"end-{n}")

    await asyncio.gather(withdraw(1), withdraw(2), withdraw(3))
    depth = 0
    for step in order:
        if step.startswith("start"):
            depth += 1
            assert depth == 1, order
        else:
            depth -= 1
            assert depth == 0, order


async def main():
    await _burst()
    await _payout_lock_serializes()
    print("concurrency.check: ok")


if __name__ == "__main__":
    asyncio.run(main())
