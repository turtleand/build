---
title: "EC2 Disk and Swap Resilience: Headroom Before Emergencies"
description: "A practical runbook for expanding EC2 disk space before increasing swap, so small servers survive temporary pressure without treating swap as real RAM."
date: 2026-06-21
tags: ["aws", "linux", "operations", "resilience"]
featured: false
draft: false
image:
  src: /images/posts/security.svg
  alt: "Shield icon representing infrastructure resilience"
locale: en
translationKey: ec2-disk-swap-resilience
slug: 2026-06-21-ec2-disk-swap-resilience
---

Small servers usually fail in boring ways.

A build cache grows. Logs accumulate. Browser automation spikes memory. A Node process, Python job, or agent service briefly needs more room than usual. The machine does not fail because the architecture is dramatic. It fails because there was no headroom left.

For a small EC2 instance, one practical resilience move is simple:

1. Expand the root disk first.
2. Then increase swap.

The order matters. Swap needs disk space. Creating a large swapfile before expanding a nearly full root filesystem can make the original disk problem worse.

## What disk headroom buys

Disk headroom turns routine growth into a maintenance task instead of an emergency.

Moving a root volume from a small size, for example `20 GB`, to a roomier size, for example `40 GB`, gives the system space for normal build artifacts, caches, logs, package installs, and temporary files. It does not make the server faster by itself. It makes routine work less fragile.

That is the point. A server should not become unstable because one normal workflow produced a little more output than expected.

## What swap buys

Swap gives the kernel a pressure valve.

If memory usage spikes briefly, an `8 GB` swapfile can let the machine slow down and recover instead of immediately killing a process. That can protect agent services, Node tools, browser automation, build tools, and Python jobs from abrupt out-of-memory failures during temporary spikes.

A useful mental model is:

```text
memory spike -> temporary slowdown -> swap absorbs pressure -> service survives
```

Without enough cushion, the path can look like this:

```text
memory spike -> OOM kill -> service death -> manual recovery
```

## The caveat

Swap is a crash cushion, not extra real RAM.

If the workload continuously needs more memory than the instance has, more swap can turn a fast crash into sustained disk thrashing. The server may appear frozen for longer because it is constantly moving memory pages between RAM and disk.

That is not resilience. That is a sizing problem.

Use swap for occasional spikes. If memory pressure is constant, reduce the workload, fix the leak, or move to an instance with more RAM.

## Safe runbook shape

After expanding the EBS volume in AWS, verify the block device, partition name, and filesystem type on the instance. NVMe device names can vary by instance and AMI, and the filesystem determines the grow command.

A common root-volume shape starts like this:

```bash
lsblk
df -hT /
sudo growpart /dev/nvme0n1 1
```

Then grow the filesystem with the command that matches `/`.

For `ext4`:

```bash
sudo resize2fs /dev/nvme0n1p1
```

For `xfs`:

```bash
sudo xfs_growfs -d /
```

Then verify the result:

```bash
df -hT /
```

The expected result is that `/` shows the larger filesystem size after the partition and filesystem are expanded.

Then replace the smaller swapfile with a larger one:

```bash
sudo swapoff /swapfile
sudo fallocate -l 8G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
swapon --show
free -h
```

If `/etc/fstab` already contains a swapfile entry, it usually looks like this:

```text
/swapfile none swap sw 0 0
```

That entry makes the swapfile persist after reboot. Verify it before assuming persistence.

## Optional tuning

A low swappiness value tells Linux to prefer RAM during normal operation and use swap more conservatively:

```bash
echo 'vm.swappiness=10' | sudo tee /etc/sysctl.d/99-swap.conf
sudo sysctl --system
```

This supports the intended behavior:

1. Stay fast during normal use.
2. Slow down during temporary pressure.
3. Recover instead of dying.

## Bottom line

Disk headroom prevents normal growth from becoming an emergency.

Swap gives temporary memory spikes somewhere to go.

Together, they make a small EC2 instance more forgiving, as long as the team remembers the boundary: swap helps with spikes, not permanently undersized workloads.
